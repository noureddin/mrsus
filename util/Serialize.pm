package Serialize;
use v5.16; use strict; use warnings; use utf8;
use open qw[ :encoding(UTF-8) :std ];
use Carp;

use parent qw[ Exporter ];
our @EXPORT = qw[ serialize ];
our @EXPORT_OK = @EXPORT;

sub serialize { my ($meta, $body) = @_;
  my @ids = sort keys %$meta;
  my @ret;
  for my $i (0..$#$body) {
    push @ret, join "\n", map { $body->[$i]{$_} // '' } @ids;
    # each unit is guaranteed to be one-line by the last block in _parse_body in Parse.pm
  }
  return join "\n", @ret;
}

1;
