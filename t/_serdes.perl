# test cases for both serialization (t/Serialize.t) and deserialization (t/deserialize.t)

serdes_test '0:0', "abc", {''=>{T=>'a'}}, [{''=>"abc"}];

serdes_test '0:1', "abc", {''=>{T=>'a'}}, [{''=>"abc"}];

serdes_test '1:0', "abc\nxyz",
  {''=>{T=>'a'},x=>{}}, [{''=>"abc",x=>"xyz"}];

serdes_test '1:1', "abc\nxyz\nA bc.\nX yz!",
{''=>{T=>'a'},x=>{}}, [
  {''=>"abc",x=>"xyz"},
  {''=>"A bc.",x=>"X yz!"},
];

serdes_test '1:2', "abc\nxyz",
  {''=>{T=>'a'},x=>{}},
  [{''=>"abc",x=>"xyz"}];

serdes_test '1:3', "abc\nxyz",
  {''=>{T=>'a'},x=>{}},
  [{''=>"abc",x=>"xyz"}];

serdes_test '2:0', (join "\n",
  'abc',   'def',  'xyz',
  'A bc.', 'Def?', 'X yz!',
), {''=>{T=>'a'},a=>{},b=>{}}, [
  {''=>"abc",a=>"def",b=>"xyz"},
  {''=>"A bc.",a=>"Def?",b=>"X yz!"},
];

serdes_test '3:0', (join "\n",
  'abc',   'def',  'xyz',
  'A bc.', 'Def?', 'X yz!',
  'B',     'E',    'Y',
), {''=>{T=>'a'},a=>{},b=>{}}, [
  {''=>"abc",a=>"def",b=>"xyz"},
  {''=>"A bc.",a=>"Def?",b=>"X yz!"},
  {''=>"B",a=>"E",b=>"Y"},
];

