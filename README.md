# Mrsus (مرصوص): Read & Search Parallel Texts of Classic Arabic and their Translation(s)

<div align="center">~~ <strong><a href="اقرأني.md">اقرأني بالعربية</a></strong> ~~</div>
<p></p>

Use it at: <https://www.noureddin.dev/mrsus/>.

## Searching

- Search queries can be either in PCRE/Perl mode, or in the “smart” mode.
- Using an unescaped `[`, `{`, or `(` enters PCRE/Perl mode. Otherwise the search is “smart”.
- To force PCRE/Perl mode if your patterns doesn't contain these brackets, include the empty pattern `[^]{0}` somewhere in your pattern.
- In Smart search mode:
  - a space matches any positive number of spaces or punctuation,
  - a space before a word (at the start of query) can match a word beginning a paragraph without being proceeded by "any positive number of spaces or punctuation",
  - similarly, a space after a word (at the end of query) can match a word ending a paragraph,
  - characters match similar looking characters (eg, `a` matches `ā`, and `"` matches `“`),
  - similarly, actually *specially,* in Arabic: an Imlaai text like `بسم الله` matches Uthmani-script `بِسۡمِ ٱللَّهِ`, including hazamat,
  - even both `الرحمن` and `الرحمان` match `ٱلرَّحۡمَـٰنِ`, and similarly any word with a dagger Alef.

## Contributing Source Books or Translations

- Please read the [Format document (in Arabic)](الصيغة.md) thoroughly.
- An Arabic book should be in Classical Arabic, preferably written before 1700 CE. The older the better.
- Share the content (whether it's an Arabic book or a translation):

  - via a PR (or an issue) in this repository, or
  - via Aosus Localization group on Matrix:
    [#localization:aosus.org](https://matrix.to/#/#localization:aosus.org).

### Content Licence

All content MUST be under a license or terms satisfying the following:

It must allow:
  - Obtaining it for free, without restrictions.
  - Redistributing it in part or in full.

It may require:
  - Mentioning the source.
  - Mentioning the revision number.
  - Keeping our copy updated.
  - Not modifying the text content.

For example, the terms of [HadeethEnc.com](https://hadeethenc.com/en/home)
are generally okay (click on "Download" then "Terms and Policies"),
but the terms of [Sunna.com](https://sunnah.com/about)
are not (see point&nbsp;8, the final heading).
Similarly, [Tanzil](https://tanzil.net/trans/) is okay,
but [Altafsir](https://www.altafsir.com/Tafasir.asp?tMadhNo=1&tTafsirNo=74&tSoraNo=1&tAyahNo=1&tDisplay=yes&LanguageID=2) is not.

## Sources

The Uthmani-script Quran is based on an earlier commit from [Mr.&nbsp;Khaled Hosny’s Quran Data](https://github.com/aliftype/quran-data/).

The Quran translations are from [Tanzil](https://tanzil.net/trans/).

The Ahaadeeth are from [Translated Prophetic Hadiths (HadeethEnc.com)](https://HadeethEnc.com/).

Inspired by [الرصائف](https://rasaif.com/), and [Parallel Quran by Clay Chip Smith](https://web.archive.org/web/20161129021628/http://www.clay.smith.name/Parallel_Quran.htm).

For searching the Quran and reading *tafasir* and translations, or testing your memorization, see [Recite](https://www.noureddin.dev/recite/) by the same developer.

## License

All source code is under the terms of Creative Commons Zero (equivalent to Public Domain), except for the following library:

<!-- - [`lzma-d-min.js` from LZMA-JS](https://github.com/LZMA-JS/LZMA-JS/blob/master/src/lzma-d-min.js) by Nathan Rugg; v2.3.0; License: MIT. -->

- [`fzstd-0.1.1.js` from fzstd by 101arrowz](https://github.com/101arrowz/fzstd); v0.1.1; License: MIT.

Other resources:

- Font: Amiri Quran 0.112, SIL OFL 1.1; <https://github.com/alif-type/amiri>.
- Font: KacstOne 5.0, GNU GPL v2; [Arabeyes fonts](https://sourceforge.net/projects/arabeyes/files/Fonts/). It is subsetted and converted to WOFF2 using glyphhanger.
- The favicon and spinner are designed by the primary developer (noureddin) and are CC0.
- The Read and Info icons are from SVGRepo.com and are CC0.

