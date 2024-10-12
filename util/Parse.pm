package Parse;
# preamble {{{
# vim: foldmethod=marker foldmarker={{{,}}} :
use v5.16; use strict; use warnings; use utf8;
use open qw[ :encoding(UTF-8) :std ];
use List::Util qw[ notall ];  # notall { ... } == any { ! ... }
use Carp;

use parent qw[ Exporter ];
our @EXPORT = qw[ parse ];
our @EXPORT_OK = (@EXPORT, qw[
  _parse_meta _parse_body _parse_title _parse_clean
]);  # the _* subs are provided for testing only

#

our %source_attributes = map { $_ => undef } qw[
  order
  title author year source description
];

our %target_attributes = map { $_ => undef } qw[
  language direction
  title author year source description
];

# note: the following are singular, b/c they are mappings;
# the previous two are plural b/c they are only used to test existence

our %short_attribute = reverse qw[
  T title
  A author
  Y year
  S source
  D description
  L language
  R direction
  O order
];

our %ascii_attribute = reverse qw[
  title        العنوان
  author       المؤلف
  year         السنة
  source       المصدر
  description  الوصف
  language     اللغة
  direction    الاتجاه
  order        الترتيب
];

our %arabic_language_code = reverse qw[
  ar عرب
  de لمن
  en انج
  es سبن
  fa فرس
  fr فنس
  it طلن
];

# For the 3-letter Arabic-script language codes, see:
# https://gist.github.com/noureddin/49f75324427447e2da89b17173ebd32d

sub parse {  # {{{1
  my $text = _parse_clean($_[0] // $_);
  my ($META, $BODY) = split /(?=^<)/m, $text, 2;
  my $meta = _parse_meta($META);
  my @ids = keys %$meta;
  my ($body, $titles) = _parse_body($BODY, @ids);
  return $meta, $body, $titles
}

sub _parse_clean {  # {{{1
  return $_[0]
    =~ s/^\h*;;;;.*(?:\n|\Z)//mgr  # remove comments
    =~ s/^\h+//mgr                 # remove leading spaces
    =~ s/\h+$//mgr                 # remove trailing spaces
}

sub _parse_title {  # {{{1
  return if $_[0] eq '';  # trailing spaces are removed
  return if $_[0] =~ /^\h*::$/;
  return $_[0] =~ s/^\h*::\h+//r;
}

sub _parse_meta {  # {{{1
  my %meta;
  my $cur_id = '';
  for my $line (split /\n/, $_[0]) {
    # each line MUST be of the form: `name: value` or `[id]`, otherwise it's an error
    if (my ($id) = $line =~ /^\[(.*)\]$/) {
      if ($id !~ /^[0-9a-z_]+$/) { croak "Invalid ID (\"$id\") in the metadata; it can only contain ASCII small-case letters, numbers, and underscore.\n" }
      if (exists $meta{$id}) { croak "Redefinition of the unit with ID (\"$id\") in the metadata.\n" }
      $cur_id = $id;
      $meta{$cur_id} = {};  # make it exist
    }
    elsif (my ($k, $v) = $line =~ /^(\w+)\h*[:=]\h*(.*)$/) {  # undocumented optional spaces and equal-sign for the colon
      $k = lc $k;
      if (exists $ascii_attribute{$k}) { $k = $ascii_attribute{$k} }  # convert «العنوان» to 'title' and so on

      my $book;
      if ($cur_id eq '') {
        $book = 'the source book';
        if (!exists $source_attributes{$k}) { croak "Unknown attribute for $book: '$k'; expected one of: ".(join ', ', sort keys %source_attributes).".\n" }
      }
      else {
        $book = "a target book ($cur_id)";
        if (!exists $target_attributes{$k}) { croak "Unknown attribute for $book: '$k'; expected one of: ".(join ', ', sort keys %target_attributes).".\n" }
      }

      if ($k eq 'year') {
        if ($v =~ /^[٠-٩]+$/) { $v =~ tr[٠-٩][0-9] }
        if ($v !~ /^[0-9]+$/) { croak "Invalid year for $book: '$v'.\n" }
        # BCE years would be indicated with a negative sign
        # (eg, -1 = 2 BCE, 0 = 1 BCE) if they were supported
      }

      if ($k eq 'order') {
        # can't verify it now; must verify at the end of metadata parsing
        # thus we only check that it's well-formed
        my @ids = grep !/^$/, split /\h+/, $v;
        if (notall { /^[0-9a-z_]+$/ } @ids) {
          croak "Invalid order for $book: '$v'; expected a list of translation IDs separated by spaces.\n"
        }
        $v = join ' ', @ids;
      }

      if ($k eq 'direction') {
        if ($v eq 'ltr' || $v eq 'يسار') { next }  # the default; ignore
        elsif ($v eq 'rtl' || $v eq 'يمين') { $v = 'rtl' }
        else { croak "Invalid direction for $book: '$v'; expected one of: rtl, ltr.\n" }
      }
      if ($k eq 'language') {
        if ($v eq 'en' || $v eq 'انج') { next }  # the default; ignore
        elsif ($v =~ /^[a-z][a-z]$/) {}  # do nothing (TODO: validate)
        elsif (exists $arabic_language_code{$v}) { $v = $arabic_language_code{$v} }
        else { croak "Invalid language for $book: '$v'; expected a small-case two-letter ISO code like 'en' for English.\n" }
      }

      $v = $v =~ s/&/&amp;/gr =~ s/</&lt;/gr =~ s/>/&gt;/gr;

      if ($k eq 'source') {
        $v = $v
          =~ s|&lt;&lt;&gt;&gt;|<br>|gr
          =~ s#\{\{(.*?)\|\|(.*?)\}\}#<a href="$2">$1</a>#gr
          =~ s|\{(.*?)\}|<a href="$1">$1</a>|gr
      }
      if ($k eq 'description') { $v = $v =~ s|&lt;&lt;&gt;&gt;|<br>|gr }

      $meta{$cur_id}{$short_attribute{$k}} = $v;

    }
    elsif ($line =~ /^$/) {
      # empty line: ignore
    }
    else {
      croak "Unrecognized line format; got:\n  $line\n  See https://github.com/noureddin/mrsus/blob/main/الصيغة.md for the proper format.\n"
    }
  }
  # now we verify the order if given
  if (exists $meta{''}{O}) {
    my @ids = ('', split ' ', $meta{''}{O});
    my %ord = map { $_ => undef } @ids;        # used in Order
    my %def = map { $_ => undef } keys %meta;  # defined in a section
    if (keys %ord != keys %def                 # number of ids is different
      or notall { exists $def{$_} } keys %ord  # some ordered ids are not defined
      or notall { exists $ord{$_} } keys %def  # some defined ids are not ordered
    ) {
      croak "Mismatching IDs in Order\n",
        "  got (sorted):", join(' ', sort keys %ord), "\n",
        "  but expected:", join(' ', sort keys %def), "\n";
    }
    # all is okay; make O an array with '' as the first element
    $meta{''}{O} = \@ids;
  }
  #
  return \%meta;
}

sub _parse_body {  # {{{1
  my %ids = map { $_ => undef } @_[1..$#_];
  my $n_ids = scalar @_ - 1;
  my %titles;
  my @body = ({});
  my $i = -1;
  my $cur_id;
  # first line starts with "<" (guaranteed by &parse)
  for my $line (split /\n/, $_[0]) {
    if (my ($t) = $line =~ /^<>(\h*::\h+.*|\h*::|)$/m) {
      my $title = _parse_title($t);
      # warn if the $i (the previous unit) doesn't have all translations
      if ($i >= 0 && keys %{$body[$i]} < $n_ids) {  # can't add unknown ids, so checking their number is enough
        my $missed = join ', ', sort grep { !exists $body[$i]{$_} } keys %ids;
        carp "Row #$i has missing translations: $missed.\n";
      }
      $cur_id = ''; ++$i;
      if ($title) { $titles{$i} = $title }
    }
    elsif (my ($id) = $line =~ /^<([0-9a-z_]+)>$/) {
      if (!defined $cur_id) { croak "Can't put a translation unit before the first source unit.\n" }
      if (!exists $ids{$id}) { croak "Unknown ID in the body: '$id'.\n" }
      if (exists $body[$i]{$id}) { croak "Redefinition of an ID in the same unit in the body: '$id'.\n" }
      $cur_id = $id;
    }
    elsif ($line =~ /^</) {
      croak "Can't start a line in the body with '<'; precede it with a backslash '\\'; found:\n  $line\n"
    }
    else {
      $body[$i]{$cur_id} .= (defined $body[$i]{$cur_id} ? "\n" : '') . $line;
    }
  }
  # we need to make it into one line:
  # remove leading and trailing newlines from each units
  # and HTML-sanitize them, and surround each unit with <p> & </p>
  # but if a unit contains an empty line,
  # then surround each contiguous block of lines with <p> & </p>
  # (comment lines are removed entirely (those starting with ';;;;'),
  # thus an "empty line" is a line that literally empty or only contains spaces.)
  # and convert line breaks to HTML hard line breaks
  # UPDATE: the convertion to HTML is done in js/dom.js, after highlighting matching substrings,
  # because a search pattern may match an html tag, and it's far from easy to avoid that,
  # so we just make sure it's a single line.
  for my $i (0..$#body) {
    for my $k (keys %ids) {
      # no warnings 'uninitialized';  # if some translations are missing; warned before
      $body[$i]{$k} = $body[$i]{$k}
        # =~ s|&|&amp;|gr
        # =~ s|<|&lt;|gr
        # =~ s|>|&gt;|gr
        =~ s|\A\n*||r
        =~ s|\n*\Z||r
        =~ s|\n\n+|\x01|gr
        =~ s|\n|\x02|gr
    }
  }
  return \@body, \%titles;
}
# }}}
1;
