#!/usr/bin/env perl
use v5.16; use warnings; use autodie; use utf8;
use open qw[ :encoding(UTF-8) :std ];

# Recite must be in an adjacent directory to this project
# https://github.com/noureddin/recite/

my @en = qw[ hilali pickthall sahih sarwar yusufali ];
my %en = map { $_ => undef } @en;
# all these translation have each aya translation on one line

print <<'END_OF_METADATA';

title: القرآن الكريم
order: hilali yusufali pickthall sahih sarwar
source: Based the Quran data of {{Recite||https://www.noureddin.dev/recite/}}, which is derivative of {{Quran-Data||https://github.com/aliftype/quran-data/}}.<<>>Translations’ info are mostly from the {{Parallel English Quran translation||https://web.archive.org/web/20161129021628/http://www.clay.smith.name/Parallel_Quran.htm}}.<<>>The translations themselves are from {{Tanzil||https://tanzil.net/trans/}}.<<>>Also check {{a survey of English Quran translations||https://al-quran.info/pages/language/english}}.

[hilali]
author: Muhammad Taqi-ud-Din al-Hilali, and Muhammad Muhsin Khan
year: 1977
source: {https://tanzil.net/trans/}
description: “Clearly this translation is well spoken of by orthodox.”

[yusufali]
author: Abdullah Yusuf Ali
year: 1934
source: {https://tanzil.net/trans/}
description: “Surely a well known translation, commentary and history.”

[pickthall]
author: Marmaduke William Muhammad Pickthall
year: 1930
source: {https://tanzil.net/trans/}
description: “Biblical English, shall ye wisheth.”

[sahih]
title: Saheeh International
year: 1997
source: {https://tanzil.net/trans/}

[sarwar]
author: Muhammad Sarwar
year: 1981
source: {https://tanzil.net/trans/}.
description: “Loose and innovative style. Attractively readable.”

END_OF_METADATA

# [maududi]
# author: Abul A'la al-Maududi
# ;;;; year: 1972
# ;;;; this is the year of completing "Tafhim-ul-Quran", an exegesis,
# ;;;; but I couldn't find more about his translation instead.

###########################

# the entire Uthmani text + all the English translation are 6MB uncompressed.
# I'll load them all into memory before starting.

sub filter_en {
  return ($_[0] // $_)
    # fix (apparently misused) control characters in hilali
    =~ s/ ?\x85 / /gr
    =~ s/ \x94//gr
    =~ s/\xad/-/gr
    # remove superfluous ` $$A` at the end of an ayah in pickthall
    =~ s/ \$+A$//r
}

my @uthm = `xz -dc ../recite/res/u.lzma`;
@{$en{$_}} = map filter_en, `xz -dc ../recite/rt/en_$_-*.lzma` for keys %en;

my @sura_length = (7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6);

my @sura_name = ('الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس');

my $s = 0;  # 0-based b/c it's used in the array
my $a = 1;  # 1-based b/c it's printed to the user

for my $i (0..6235) {
  print $a == 1 ? "<>:: سورة $sura_name[$s]\n" : "<>\n";
  #
  print $uthm[$i] =~ s/[#A-Z<>]+//gr;  # remove tajweed color-coding & additional basmala
  #
  print "<$_>\n$en{$_}[$i]" for @en;
  print "\n";
  #
  if ($sura_length[$s] == $a) { ++$s; $a = 1 } else { ++$a }
  ++$i;
}

