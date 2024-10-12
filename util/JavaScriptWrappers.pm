package JavaScriptWrappers;
use v5.16; use strict; use warnings; use utf8;
use open qw[ :encoding(UTF-8) :std ];

use parent qw[ Exporter ];  # no exports by default
our @EXPORT_OK = qw[
  deserialize
];

use FindBin;
use constant ROOT => "$FindBin::RealBin/..";
# Caution: due to FindBin's limitations, this is okay only if the calling
# script is on the same level as this module, like util/build.pl or
# t/deserialize.t; thus this is okay for this project.

use Deno; *js_eval = \&deno_eval;  # to allow for other evaluators

sub slurp(_) { local $/; open my $f, '<', $_[0]; return scalar <$f> }

sub wrap {
  my $fn = shift;
  my $args = \@_;
  my $code = slurp ROOT."/js/$fn.js";
  return js_eval($code, $fn, $args);
}

sub deserialize { return wrap(deserialize => @_) }

1;
