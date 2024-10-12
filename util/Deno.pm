package Deno;
use v5.16; use strict; use warnings; use utf8;
use open qw[ :encoding(UTF-8) :std ];
use JSON;

sub unjson { JSON->new->boolean_values(0, 1)->decode($_[0]) }
# equiv to from_json, but converts bools to 0/1 instead of blessed objects

# our libraries
use Utils;  # make_tempfile, execute

###

use parent qw[ Exporter ];
our @EXPORT = qw[ deno_eval cleancss uglifyjs ];
our @EXPORT_OK = @EXPORT;

###

our $deno = 'deno run --quiet --no-prompt';
# change 'deno' if it's not in your $PATH.
# only the 'run' subcommand is ever used.
# '--quiet' suppresses diagnostic output.
# '--no-prompt' throws immediately if a required permission if not granted on the commandline.

# deno run ~
our $CSS = '--allow-read --allow-env=HTTP_PROXY,http_proxy npm:clean-css-cli';
our $JS  = '--allow-read --allow-env=UGLIFY_BUG_REPORT     npm:uglify-js';

# deno run npm:uglify-js ~
our $mangle = '--compress passes=10 --mangle toplevel';
# we don't reserve any toplevel names

###

sub deno_run_on_file {
  my $fpath = pop;
  my $fpath_quoted = $fpath =~ s/'/'\\''/gr =~ s/\A|\Z/'/gr;
  return execute "$deno @_ -- $fpath_quoted";
}

# both accept one argument: a file path
sub cleancss { deno_run_on_file "$CSS -O2",    $_[0] }
sub uglifyjs { deno_run_on_file "$JS $mangle", $_[0] }

sub deno_eval { my ($code, $funname, $args) = @_;
  my $args_json = to_json($args)
    =~ s/'/\\'/gr =~ s/\A|\Z/'/gr
    =~ s/\\\\/$&$&/gr =~ s/\\[nru]/\\$&/gr  # https://stackoverflow.com/a/42073
  ;
  my $fpath = make_tempfile_with $code,
    ";console.log(JSON.stringify($funname(...JSON.parse($args_json))))";
  my $ret_json = deno_run_on_file $fpath;
  unlink $fpath;
  return $ret_json eq '' ? undef : unjson($ret_json);
}

1;
