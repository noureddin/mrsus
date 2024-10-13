#!/usr/bin/env perl
### preamble {{{
# vim: foldmethod=marker foldmarker={{{,}}} :
use v5.16; use warnings; use autodie; use utf8;
use open qw[ :encoding(UTF-8) :std ];

use File::Copy;
use JSON;

sub tojson { JSON->new->canonical->encode($_[0]) }
# equiv to to_json, but keeps the object keys sorted, to reduce diff

# filesystem

sub touch { utime undef, undef, $_[0] }

sub write_file {
  my ($content, $mode, $path) = @_;
  open my ($f), $mode, $path;
  print { $f } $content if $content;
}
sub make_file { write_file(reverse @_) }

sub slurp(_) { local $/; open my $f, '<', $_[0]; return scalar <$f> }
sub slurp_zstd(_) { local $/; open my $f, '-|', "zstdcat '$_[0]'"; return scalar <$f> }

sub mtime(_) { (stat($_[0]))[9] }

# hashing

# for hashing static files to cache-bust them on change
use Digest::file qw[ digest_file_base64 ];
sub hashfile(_) { digest_file_base64(shift, 'SHA-1') =~ tr[+/][-_]r }

# for hashing static data before compression to check if they differ
use Digest; use Encode qw[ encode ];
sub hashstr(_) {
  my $s = Digest->new("SHA-1");
  $s->add(encode('UTF-8', shift));
  return $s->b64digest;
}

# our libraries

use FindBin;
use lib $FindBin::RealBin;
chdir "$FindBin::RealBin/..";  # make sure we are in the root of the repo

use Parse;
use Serialize;
use Utils;
use Deno;

### building /static/data/*.zst from /data/* {{{1

# make sure output directories exist
-e or mkdir for 'docs', 'static/data';

sub needed { my ($dst, $src) = @_;
  return !-e $dst || mtime($dst) < mtime($src);
  # usage:  if (needed $out => $in) { ... }
  # mnemonic 1: "if (needed $out, ..." == if $out is needed (followed by additional info)
  # mnemonic 2: "=>" is "depends on"; == if needed $out, which depends on $in, then...
}

my %meta;
my %tocs;
my %hash;

for my $name (map s,.*/,,r, glob 'data/*') {
  my $in = "data/$name";
  my $o = "static/data/$name";
  my $outz = "$o.zst";
  my $meta_cache = "static/data/.$name.meta.json";
  #
  if (needed $outz => $in or needed $meta_cache => $in) {
    my @parse = parse slurp $in;
    my $ser = serialize(@parse);
    if (!-e $outz || hashstr(slurp_zstd($outz)) ne hashstr($ser)) {
      write_file $ser, '>', $o;
      system 'zstd', '-k', '-9', $o;
      unlink $o;
    }
    else {
      touch $outz;  # update timestamps so it doesn't trigger needed() later
    }
    $meta{$name} = $parse[0];
    $tocs{$name} = $parse[2];
    write_file tojson([$meta{$name},$tocs{$name}]), '>', $meta_cache;
  }
  else {
    ($meta{$name}, $tocs{$name}) = @{from_json slurp $meta_cache};
  }
  $hash{$name} = hashfile($outz);
}

### static files {{{1

### favicon

if (needed "docs/favicon.svg" => "static/favicon.svg") {
  # minify, don't copy
  make_file "docs/favicon.svg", '>',
    slurp("static/favicon.svg")
      =~ s/<!--.*-->//gr
      =~ s/\s+/ /gr
      =~ s/> </></gr
      =~ s| />|/>|gr
      =~ s/^ | $//gr
}

# TODO: added PNGs

### copying static files

sub stapy(_) { my ($src) = @_;  # "stapy" = "static" (n) + "copy (v)"
  my $dst = $src =~ s,.*/,docs/,r;
  if (needed $dst => $src) {
    copy $src => $dst or die "Copy failed: $!";
  }
}

stapy for glob 'static/fonts/* static/data/*.zst';

### preamble of generating index.html {{{1

# the books ids (data/*), sorted humanly
my @bids = qw[
  quran
  hadeethenc
];

die "data file not found: $_; expected" for grep { ! -e "data/$_" } @bids;
warn "data file not included: $_; expected" for
  map { my $f = $_; (grep { $f eq $_ } @bids) == 0 ? $f : () }
    map s|.*/||r, glob 'data/*';

my $js_debug = 0;  # set to 1 for debug, to 0 for prod

sub minjs_file {  # takes a path of js code, and returns its content minified
  return $js_debug ? slurp $_[0] : uglifyjs $_[0];
}

sub minjs {  # takes a string of js code, and returns it minified
  my $path = make_tempfile_with @_;
  my $script = minjs_file $path;
  unlink $path;
  return $script;
}

my @scripts = map s,^,js/,r, grep !/!/, qw[
  utils.js
  elems.js
  dom.js
  deserialize.js
  z.js
  read.js
  info.js
  search.js
  main.js
];

die "script file not found: $_; expected" for grep { ! -e } @scripts;

#

my $HTML_OUT = 'docs/index.html';
my $html_time = -e $HTML_OUT ? mtime($HTML_OUT) : 0;

exit unless $html_time != 0 ||
  grep { $html_time < mtime($_) }
    @scripts, qw[ static/index.html static/style.css ];

### start html processing (metatags, bookfilter, minify) {{{1

my $html = slurp 'static/index.html';

$html =~ s/<!--.*?-->//sg;

my $bf = join "", map {
  my $ch = (keys %{$meta{$_}}) > 1 ? 'checked' : '';  # uncheck if has no transaltion
  my $y = $meta{$_}{''}{Y};
  my $t = $meta{$_}{''}{T} . ($y ? ' (' . $y =~ tr[0-9][٠-٩]r . 'م)' : '');  # re-done in js/dom.js
  qq[<label><input type="checkbox" id="f_$_" $ch>&ensp;$t</label><br>]
} @bids;
$html =~ s{<<bookfilter>>}{$bf};

my @ids = $html =~ /id="([^"]+)"/g;

my $title = 'مرصوص - اقرأ وابحث في الكتب العربية الفصيحة وترجماتها';
# my $desc = '';
my $desc = '';
my $url = 'https://www.noureddin.dev/mrsus';

$html =~ s{<<meta>>}{
  <title>$title</title>
  <link rel="canonical" href="$url/">
  <meta property="og:url" content="$url/">
  <meta property="og:locale" content="ar_AR">
  <meta property="og:type" content="website">
  <meta property="og:title" content="$title">
<!--
  <meta property="og:image" content="$url/cover.png">
  <meta property="og:image:width" content="1120"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:description" content="$desc">
  <meta name="description" content="$desc">
  <link rel="icon" type="image/png" sizes="72x72" href="res/favicon-72.png">
  <link rel="icon" type="image/png" sizes="16x16" href="res/favicon-16.png">
-->
  <link rel="icon" type="image/svg+xml" sizes="any" href="favicon.svg">
}sg;

# minify html
$html = $html
  =~ s/\s+</</gr  # note: this changes the behavior of the html; I'm relying on that
  =~ s/\s+/ /gr
  =~ s/&space;/ /gr  # for the rarely needed space that would otherwise be removed by the first rule
  =~ s/&newline;/\n/gr  # for the even rarer newline
  =~ s/<!--.*?-->//sgr
  =~ s/\A //r =~ s/ \Z//r
  ;

### css and javascript, and finishing {{{1

# style
my $style = cleancss 'static/style.css';
$html =~ s{<<style>>}{<style>$style</style>}g;

# script

my $script = minjs
  "const meta = ".(tojson \%meta)."\n",  # this is usually safe
  "const tocs = ".(tojson \%tocs)."\n",  # this is usually safe
  "const hash = ".(tojson \%hash)."\n",  # this is usually safe
  (map { "const el_$_ = Qid('$_')\n" } @ids),
  (sprintf "const bids = [%s]\n", join ',', map { "'$_'" } @bids),
  (join "\n", map { slurp } @scripts);

$html =~ s{<<script>>}{<script>"use strict";$script</script>};

# end
write_file $html, '>', $HTML_OUT;

### worker-related files {{{1

stapy 'js/fzstd-0.1.1.js';
# stapy 'js/lzma-d-min.js';

make_file 'docs/worker.js', '>', minjs_file 'js/worker.js';

# lzma-d-min.js from LZMA-JS by Nathan Rugg; v2.3.0; License: MIT.
# https://github.com/LZMA-JS/LZMA-JS/blob/master/src/lzma-d-min.js

# fzstd-0.1.1.js from fzstd by 101arrowz; v0.1.1; License: MIT.
# https://github.com/101arrowz/fzstd

