#!/usr/bin/env perl
use v5.16; use warnings; use autodie; use utf8;
use open qw[ :encoding(UTF-8) :std ];

use FindBin;
use lib  $FindBin::RealBin;  # for the do-statement below
use lib "$FindBin::RealBin/../util/";

use Test::More;

use Serialize;

sub serdes_test { is serialize($_[2], $_[3]) // '', $_[1] // [], $_[0] // '' }

do '_serdes.perl' or die $!;

done_testing;
