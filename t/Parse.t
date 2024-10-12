#!/usr/bin/env perl
use v5.16; use warnings; use autodie; use utf8;
use open qw[ :encoding(UTF-8) :std ];

use FindBin;
use lib "$FindBin::RealBin/../util/";

use Test::More;

use Parse qw[ parse _parse_meta _parse_body _parse_title _parse_clean ];

sub throws_ok(&;$$) { my ($sub, $rx, $desc) = @_;
  $rx //= qr//;  # matches anything; thus simulates dies_ok
  $desc //= $rx;
  my $ret = eval { $sub->() };
  ok !defined $ret && $@ =~ $rx, $desc;
  # I should use Test::Exception, but I wanted fewer non-core libs.
}

sub test_meta {
  is_deeply _parse_meta(_parse_clean($_[2])) // [],
  $_[1] // [],
  'meta: '. ($_[0] // ''),
}

sub test_meta_fail { my ($n, $attr, $in) = @_;
  throws_ok { _parse_meta(_parse_clean($in)) }
  qr/$attr/i,
  "meta guard $n: $attr",
}

sub test_title {
  is_deeply [_parse_title($_[2])],
  $_[1] // [],
  'title: '. ($_[0] // ''),
}

my @ids;

sub test_body {
  is_deeply +(_parse_body(_parse_clean($_[2]), '', @ids))[0] // [],  # that ()[0] to ignore %titles
  $_[1] // [],
  'body: '. ($_[0] // ''),
}

my $t = '';

################################################################################

$t = 'basics';
test_meta "0 $t", {''=>{T=>'ahlan'}}, "title: ahlan";
test_meta "1 $t", {''=>{T=>'ahlan',A=>'Me'}}, "title: ahlan\nauthor: Me";
$t = 'translation';
test_meta "2 $t", {''=>{T=>'ahlan',A=>'Me'},x=>{}}, "title: ahlan\nauthor: Me\n[x]\n";
test_meta "3 $t", {''=>{T=>'ahlan',A=>'Me'},x=>{T=>'X'}}, "title: ahlan\nauthor: Me\n[x]\ntitle:X";
$t = 'attribute validation';
test_meta "4 $t", {''=>{T=>'ahlan',Y=>10}}, "title: ahlan\nyear:10";
test_meta "5 $t", {''=>{T=>'ahlan',A=>'Me'},x=>{T=>'X',Y=>99999}}, "title: ahlan\nauthor: Me\n[x]\ntitle:X\nyear: 99999";
test_meta "6 $t", {''=>{T=>'ahlan',A=>'Me'},x=>{T=>'X',L=>'xy'}}, "title: ahlan\nauthor: Me\n[x]\ntitle:X\nlanguage:xy";
test_meta "7 $t", {''=>{T=>'ahlan',A=>'Me'},x=>{T=>'X',R=>'rtl'}}, "title: ahlan\nauthor: Me\n[x]\ntitle:X\ndirection:rtl";
$t = 'remove if default'; # language & direction are removed if match the default
test_meta "8 $t", {''=>{T=>'ahlan',A=>'Me'},x=>{T=>'X'}}, "title: ahlan\nauthor: Me\n[x]\ntitle:X\ndirection:ltr";
test_meta "9 $t", {''=>{T=>'ahlan',A=>'Me'},x=>{T=>'X'}}, "title: ahlan\nauthor: Me\n[x]\ntitle:X\nlanguage: en";

$t = 'arabic: basics';
test_meta "0 $t", {''=>{T=>'أهلا وسهلا'}}, "العنوان: أهلا وسهلا";
test_meta "1 $t", {''=>{T=>'أهلا وسهلا',A=>'أنا'}}, "العنوان: أهلا وسهلا\nالمؤلف: أنا";
$t = 'arabic: translation';
test_meta "2 $t", {''=>{T=>'أهلا',A=>'أنا'},x=>{}}, "العنوان: أهلا\nالمؤلف: أنا\n[x]\n";
test_meta "3 $t", {''=>{T=>'أهلا',A=>'أنا'},x=>{T=>'X'}}, "title: أهلا\nالمؤلف: أنا\n[x]\nالعنوان: X";
$t = 'arabic: attribute validation';
test_meta "4 $t", {''=>{T=>'ahlan',Y=>10}}, "العنوان: ahlan\nالسنة:10";
test_meta "5 $t", {''=>{T=>'ahlan',Y=>1234}}, "العنوان: ahlan\nالسنة:١٢٣٤";
test_meta "6 $t", {''=>{T=>'أهلا',A=>'أنا'},x=>{T=>'X',L=>'xy'}}, "العنوان: أهلا\nالمؤلف: أنا\n[x]\ntitle:X\nاللغة:xy";
test_meta "7 $t", {''=>{T=>'أهلا',A=>'أنا'},x=>{T=>'X',L=>'ar'}}, "العنوان: أهلا\nالمؤلف: أنا\n[x]\ntitle:X\nاللغة:عرب";
test_meta "8 $t", {''=>{T=>'أهلا',A=>'أنا'},x=>{T=>'X',L=>'fr'}}, "العنوان: أهلا\nالمؤلف: أنا\n[x]\ntitle:X\nاللغة:فنس";
test_meta "9 $t", {''=>{T=>'أهلا',A=>'أنا'},x=>{T=>'X',R=>'rtl'}}, "العنوان: أهلا\nالمؤلف: أنا\n[x]\ntitle:X\nالاتجاه:يمين";
$t = 'arabic: remove if default'; # language & direction are removed if match the default
test_meta "10 $t", {''=>{T=>'أهلا',A=>'أنا'},x=>{T=>'X'}}, "العنوان: أهلا\nالمؤلف: أنا\n[x]\ntitle:X\nالاتجاه:يسار";
test_meta "11 $t", {''=>{T=>'أهلا',A=>'أنا'},x=>{T=>'X'}}, "العنوان: أهلا\nالمؤلف: أنا\n[x]\ntitle:X\nاللغة:انج";

$t = 'order';
test_meta "0 $t", {''=>{T=>'ahlan',O=>['','x']},x=>{}}, "title: ahlan\nOrder:x\n[x]";
test_meta "1 $t", {''=>{T=>'ahlan',O=>['','x','a']},x=>{},a=>{}}, "title: ahlan\nOrder: x a\n[x]\n[a]";
test_meta "2 $t", {''=>{T=>'ahlan',O=>['','a','x']},x=>{},a=>{}}, "title: ahlan\nOrder:a x\n[x]\n[a]";

# test guards
test_meta_fail 0 => order => "title: ahlan\nOrder:y\n[x]";
test_meta_fail 1 => order => "title: ahlan\nOrder:y a\n[x]\n[y]";
test_meta_fail 2 => order => "title: ahlan\nOrder:x y\n[x]";
test_meta_fail 3 => order => "title: ahlan\nOrder:y\n[x]\n[y]";
test_meta_fail 4 => year => "title: ahlan\nyear:abc";
test_meta_fail 5 => language =>  "title: ahlan\n[x]language:xyz";
test_meta_fail 6 => direction => "title: ahlan\n[x]direction:xyz";
test_meta_fail 7 => redefinition => "title: ahlan\n[x]\n[y]\n[x]";
test_meta_fail 8 => redefinition => "title: ahlan\n[x]\n[x]\n[y]";
test_meta_fail 9 => 'unknown attribute' => "title: ahlan\nyalla:abc";

# REMEMBER: the input is $1 from /^\h*<>(\h*::\h+.*)\h*$/
test_title '0',  [], "";
test_title '1',  [], "::";
test_title '2',  ['a'], ":: a";
test_title '3',  ['a ::'], ":: a ::";
test_title '4',  ['a :: b'], ":: a :: b";
test_title '5',  ['a :: b::c'], ":: a :: b::c";
test_title '6',  ['a :: b::c::'], ":: a :: b::c::";
test_title '7',  ['a :: b::c ::'], ":: a :: b::c ::";
test_title '8',  ['a :: b::c ::'], " :: a :: b::c ::";
test_title '9',  ['a :: :: ::'], " :: a :: :: ::";
test_title '10', [':: :: a ::'], " :: :: :: a ::";
test_title '11', [':: :: :: a'], " :: :: :: :: a";

### old tests, when titles were supposed to be hierarchical
# # REMEMBER: the input is $1 from /^\h*<>(\h*::\h+.*)\h*$/
# test_title '0', [0], "";
# test_title '1', [1], "::";
# test_title '2', [0, 'a'], ":: a";
# test_title '3', [1, 'a'], ":: a ::";
# test_title '4', [0, 'a', 'b'], ":: a :: b";
# test_title '5', [0, 'a', 'b::c'], ":: a :: b::c";
# test_title '6', [0, 'a', 'b::c::'], ":: a :: b::c::";
# test_title '7', [1, 'a', 'b::c'], ":: a :: b::c ::";
# test_title '8', [1, 'a', 'b::c'], " :: a :: b::c ::";
# test_title '9', [1, 'a'], " :: a :: :: ::";  # empty sections are dropped
# test_title '10', [1, 'a'], " :: :: :: a ::";
# test_title '11', [0, 'a'], " :: :: :: :: a";

@ids = qw[ ];
test_body '0:0', [{''=>"abc"}], "<>\nabc";

test_body '0:1', [{''=>"abc"}], "<>::\nabc";
test_body '0:2', [{''=>"abc"}], "<> ::\nabc";
test_body '0:3', [{''=>"abc"}], "<>:: x\nabc";
test_body '0:4', [{''=>"abc"}], "<> :: x\nabc";
test_body '0:5', [{''=>"abc"}], "<> :: x ::\nabc";
test_body '0:6', [{''=>"abc"}], "<> :: x :: y\nabc";
test_body '0:7', [{''=>"abc"}], "<> :: x :: y ::\nabc";

@ids = qw[ a ];
test_body '1:0', [{''=>"abc",a=>"hi"}], "<>\nabc\n<a>\nhi";
test_body '1:1',
  [{''=>"abc",a=>"alpha"},{''=>"A\x02B\x01C",a=>"xyz"}],
    "<>\nabc\n<a>\nalpha\n<>\nA\nB\n\n\nC\n<a>\nxyz";

done_testing;
