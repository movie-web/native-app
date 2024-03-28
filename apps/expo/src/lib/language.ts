import type { LanguageCode } from "iso-639-1";
import iso from "iso-639-1";

export function getPrettyLanguageNameFromLocale(locale: string): string | null {
  return iso.getName(locale);
}

export const getCountryCodeFromLanguage = (
  languageCode: LanguageCode,
): string => {
  return languageToCountryMap[languageCode] || "";
};

const languageToCountryMap: Record<LanguageCode, string> = {
  en: "US", // English - United States
  es: "ES", // Spanish - Spain
  fr: "FR", // French - France
  zh: "CN", // Mandarin - China
  ar: "SA", // Arabic - Saudi Arabia
  de: "DE", // German - Germany
  ru: "RU", // Russian - Russia
  pt: "PT", // Portuguese - Portugal
  it: "IT", // Italian - Italy
  ja: "JP", // Japanese - Japan
  ko: "KR", // Korean - South Korea
  hi: "IN", // Hindi - India
  sv: "SE", // Swedish - Sweden
  nl: "NL", // Dutch - Netherlands
  pl: "PL", // Polish - Poland
  tr: "TR", // Turkish - Turkey
  el: "GR", // Greek - Greece
  he: "IL", // Hebrew - Israel
  vi: "VN", // Vietnamese - Vietnam
  th: "TH", // Thai - Thailand
  cs: "CZ", // Czech - Czech Republic
  da: "DK", // Danish - Denmark
  fi: "FI", // Finnish - Finland
  hu: "HU", // Hungarian - Hungary
  no: "NO", // Norwegian - Norway
  ro: "RO", // Romanian - Romania
  sk: "SK", // Slovak - Slovakia
  sl: "SI", // Slovenian - Slovenia
  uk: "UA", // Ukrainian - Ukraine
  bg: "BG", // Bulgarian - Bulgaria
  hr: "HR", // Croatian - Croatia
  lt: "LT", // Lithuanian - Lithuania
  lv: "LV", // Latvian - Latvia
  et: "EE", // Estonian - Estonia
  sr: "RS", // Serbian - Serbia
  bs: "BA", // Bosnian - Bosnia and Herzegovina
  mk: "MK", // Macedonian - North Macedonia
  sq: "AL", // Albanian - Albania
  mt: "MT", // Maltese - Malta
  is: "IS", // Icelandic - Iceland
  ga: "IE", // Irish - Ireland
  cy: "GB", // Welsh - United Kingdom
  eu: "ES", // Basque - Spain
  ca: "ES", // Catalan - Spain
  gl: "ES", // Galician - Spain
  af: "ZA", // Afrikaans - South Africa
  sw: "TZ", // Swahili - Tanzania
  am: "ET", // Amharic - Ethiopia
  so: "SO", // Somali - Somalia
  ha: "NG", // Hausa - Nigeria
  ig: "NG", // Igbo - Nigeria
  yo: "NG", // Yoruba - Nigeria
  rw: "RW", // Kinyarwanda - Rwanda
  ny: "MW", // Chichewa - Malawi
  mg: "MG", // Malagasy - Madagascar
  ln: "CD", // Lingala - Democratic Republic of the Congo
  tg: "TJ", // Tajik - Tajikistan
  uz: "UZ", // Uzbek - Uzbekistan
  tk: "TM", // Turkmen - Turkmenistan
  ky: "KG", // Kyrgyz - Kyrgyzstan
  mn: "MN", // Mongolian - Mongolia
  ps: "AF", // Pashto - Afghanistan
  ur: "PK", // Urdu - Pakistan
  fa: "IR", // Persian (Farsi) - Iran
  ku: "IQ", // Kurdish - Iraq
  sd: "PK", // Sindhi - Pakistan
  ne: "NP", // Nepali - Nepal
  si: "LK", // Sinhala - Sri Lanka
  km: "KH", // Khmer - Cambodia
  lo: "LA", // Lao - Laos
  my: "MM", // Burmese - Myanmar
  ka: "GE", // Georgian - Georgia
  hy: "AM", // Armenian - Armenia
  az: "AZ", // Azerbaijani - Azerbaijan
  bm: "ML", // Bambara - Mali
  ff: "SN", // Fulfulde - Senegal
  ti: "ER", // Tigrinya - Eritrea
  xh: "ZA", // Xhosa - South Africa
  zu: "ZA", // Zulu - South Africa
  ms: "MY", // Malay - Malaysia
  id: "ID", // Indonesian - Indonesia
  jv: "ID", // Javanese - Indonesia
  su: "ID", // Sundanese - Indonesia
  tl: "PH", // Tagalog - Philippines
  ml: "IN", // Malayalam - India
  te: "IN", // Telugu - India
  ta: "IN", // Tamil - India
  mr: "IN", // Marathi - India
  bn: "BD", // Bengali - Bangladesh
  gu: "IN", // Gujarati - India
  kn: "IN", // Kannada - India
  or: "IN", // Oriya - India
  pa: "IN", // Punjabi - India
  aa: "ET", // Afar - Ethiopia
  ab: "GE", // Abkhazian - Georgia
  ae: "IR", // Avestan - Iran
  ak: "GH", // Akan - Ghana
  an: "ES", // Aragonese - Spain
  as: "IN", // Assamese - India
  av: "RU", // Avaric - Russia
  ay: "BO", // Aymara - Bolivia
  ba: "RU", // Bashkir - Russia
  be: "BY", // Belarusian - Belarus
  bi: "VU", // Bislama - Vanuatu
  bo: "CN", // Tibetan - China
  br: "FR", // Breton - France
  ce: "RU", // Chechen - Russia
  ch: "GU", // Chamorro - Guam
  co: "FR", // Corsican - France
  cr: "CA", // Cree - Canada
  cu: "RU", // Church Slavic - Russia
  cv: "RU", // Chuvash - Russia
  dv: "MV", // Dhivehi - Maldives
  dz: "BT", // Dzongkha - Bhutan
  ee: "GH", // Ewe - Ghana
  eo: "—", // Esperanto - International (Constructed Language)
  fj: "FJ", // Fijian - Fiji
  fo: "FO", // Faroese - Faroe Islands
  fy: "NL", // Western Frisian - Netherlands
  gd: "GB", // Scottish Gaelic - United Kingdom
  gn: "PY", // Guarani - Paraguay
  gv: "IM", // Manx - Isle of Man
  ho: "PG", // Hiri Motu - Papua New Guinea
  ht: "HT", // Haitian Creole - Haiti
  hz: "NA", // Herero - Namibia
  ia: "—", // Interlingua - International (Constructed Language)
  ie: "—", // Interlingue - International (Constructed Language)
  ii: "CN", // Sichuan Yi - China
  ik: "US", // Inupiaq - United States
  io: "—", // Ido - International (Constructed Language)
  iu: "CA", // Inuktitut - Canada
  kg: "CG", // Kongo - Congo
  ki: "KE", // Kikuyu - Kenya
  kj: "AO", // Kuanyama - Angola
  kk: "KZ", // Kazakh - Kazakhstan
  kl: "GL", // Kalaallisut - Greenland
  kr: "NE", // Kanuri - Niger
  ks: "IN", // Kashmiri - India
  kv: "RU", // Komi - Russia
  kw: "GB", // Cornish - United Kingdom
  la: "VA", // Latin - Vatican City
  lb: "LU", // Luxembourgish - Luxembourg
  lg: "UG", // Ganda - Uganda
  li: "NL", // Limburgish - Netherlands
  lu: "CD", // Luba-Katanga - Democratic Republic of the Congo
  mh: "MH", // Marshallese - Marshall Islands
  mi: "NZ", // Maori - New Zealand
  na: "NR", // Nauru - Nauru
  nb: "NO", // Norwegian Bokmål - Norway
  nd: "ZW", // North Ndebele - Zimbabwe
  ng: "NA", // Ndonga - Namibia
  nn: "NO", // Norwegian Nynorsk - Norway
  nr: "ZA", // South Ndebele - South Africa
  nv: "US", // Navajo - United States
  oc: "FR", // Occitan - France
  oj: "CA", // Ojibwe - Canada
  om: "ET", // Oromo - Ethiopia
  os: "GE", // Ossetian - Georgia
  pi: "IN", // Pali - India
  qu: "PE", // Quechua - Peru
  rm: "CH", // Romansh - Switzerland
  rn: "BI", // Rundi - Burundi
  sa: "IN", // Sanskrit - India
  sc: "IT", // Sardinian - Italy
  se: "NO", // Northern Sami - Norway
  sg: "CF", // Sango - Central African Republic
  sm: "WS", // Samoan - Samoa
  sn: "ZW", // Shona - Zimbabwe
  ss: "SZ", // Swati - Eswatini
  st: "LS", // Southern Sotho - Lesotho
  tn: "BW", // Tswana - Botswana
  to: "TO", // Tonga - Tonga
  ts: "ZA", // Tsonga - South Africa
  tt: "RU", // Tatar - Russia
  tw: "GH", // Twi - Ghana
  ty: "PF", // Tahitian - French Polynesia
  ug: "CN", // Uyghur - China
  ve: "ZA", // Venda - South Africa
  vo: "—", // Volapük - International (Constructed Language)
  wa: "BE", // Walloon - Belgium
  wo: "SN", // Wolof - Senegal
  yi: "—", // Yiddish - International (Primarily spoken among Jewish communities)
  za: "CN", // Zhuang - China
};
