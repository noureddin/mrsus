package Utils;
use v5.16; use strict; use warnings; use utf8;
use open qw[ :encoding(UTF-8) :std ];
use File::Temp qw[ tempfile ];

use parent qw[ Exporter ];
our @EXPORT = qw[
  make_tempfile
  make_tempfile_with
  execute
];
our @EXPORT_OK = @EXPORT;

sub make_tempfile() {
  my ($fh, $fpath) = tempfile('mrsus-'.'X'x10, UNLINK => 1);
  binmode $fh, ':encoding(UTF-8)';
  return $fh, $fpath;
}

sub make_tempfile_with {
  my ($fh, $fpath) = make_tempfile;
  print { $fh } @_;
  close $fh;
  return $fpath;
}

sub execute {
  warn "execute: too many args\n" if @_ > 1;
  my $ret = scalar `$_[0]`; chomp $ret; return $ret;
}


1;
