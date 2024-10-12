#!/usr/bin/env perl
use v5.16; use warnings; use autodie; use utf8;
use open qw[ :encoding(UTF-8) :std ];

use FindBin;
use lib  $FindBin::RealBin;  # for the do-statement below
use lib "$FindBin::RealBin/../util/";

use Test::More;

use JavaScriptWrappers qw[ deserialize ];
use Data::Dumper;

# same arguments & order as test_serialize; thus effectively reversed
sub serdes_test {
  my ($name, $serial, $meta, $body) = @_;
  my $got = [deserialize([sort keys %$meta], $serial)];
  is_deeply $got, [$body // []], $name // '' or diag explain $got;
}

do '_serdes.perl' or die $!;

done_testing;
