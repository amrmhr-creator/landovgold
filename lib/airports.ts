// Airports for the lead form's from/to pickers. Egypt first, then the Gulf and
// Arab world (where most customers work), then the rest of the world.
// Anything missing can still be typed freely in the form.

export type Airport = {
  code: string; // IATA
  city: string; // Arabic city, plus the airport when a city has more than one
  country: string;
  en: string; // English city/airport, for searching in English
};

const A = (code: string, city: string, country: string, en: string): Airport => ({ code, city, country, en });

export const AIRPORTS: Airport[] = [
  // Egypt
  A("CAI", "القاهرة", "مصر", "Cairo"),
  A("SPX", "سفنكس (الجيزة)", "مصر", "Sphinx Giza"),
  A("CCE", "العاصمة الإدارية", "مصر", "Capital International"),
  A("HBE", "الإسكندرية - برج العرب", "مصر", "Alexandria Borg El Arab"),
  A("ASW", "أسوان", "مصر", "Aswan"),
  A("LXR", "الأقصر", "مصر", "Luxor"),
  A("ABS", "أبو سمبل", "مصر", "Abu Simbel"),
  A("HRG", "الغردقة", "مصر", "Hurghada"),
  A("SSH", "شرم الشيخ", "مصر", "Sharm El Sheikh"),
  A("RMF", "مرسى علم", "مصر", "Marsa Alam"),
  A("TCP", "طابا", "مصر", "Taba"),
  A("DBB", "العلمين", "مصر", "El Alamein"),
  A("MUH", "مرسى مطروح", "مصر", "Marsa Matruh"),
  A("ATZ", "أسيوط", "مصر", "Assiut"),
  A("HMB", "سوهاج", "مصر", "Sohag"),
  A("EMY", "المنيا", "مصر", "El Minya"),
  A("UVL", "الوادي الجديد (الخارجة)", "مصر", "New Valley Kharga"),
  A("AAC", "العريش", "مصر", "El Arish"),

  // Saudi Arabia
  A("RUH", "الرياض", "السعودية", "Riyadh"),
  A("JED", "جدة", "السعودية", "Jeddah"),
  A("MED", "المدينة المنورة", "السعودية", "Madinah Medina"),
  A("DMM", "الدمام", "السعودية", "Dammam"),
  A("AHB", "أبها", "السعودية", "Abha"),
  A("TIF", "الطائف", "السعودية", "Taif"),
  A("TUU", "تبوك", "السعودية", "Tabuk"),
  A("ELQ", "القصيم", "السعودية", "Qassim Buraidah"),
  A("GIZ", "جازان", "السعودية", "Jazan Jizan"),
  A("HAS", "حائل", "السعودية", "Hail"),
  A("YNB", "ينبع", "السعودية", "Yanbu"),
  A("HOF", "الأحساء", "السعودية", "Al Ahsa Hofuf"),
  A("AJF", "الجوف", "السعودية", "Al Jouf"),
  A("EAM", "نجران", "السعودية", "Najran"),
  A("ULH", "العلا", "السعودية", "AlUla"),

  // Gulf
  A("DXB", "دبي", "الإمارات", "Dubai"),
  A("DWC", "دبي - آل مكتوم", "الإمارات", "Dubai World Central Al Maktoum"),
  A("AUH", "أبوظبي", "الإمارات", "Abu Dhabi"),
  A("SHJ", "الشارقة", "الإمارات", "Sharjah"),
  A("RKT", "رأس الخيمة", "الإمارات", "Ras Al Khaimah"),
  A("FJR", "الفجيرة", "الإمارات", "Fujairah"),
  A("KWI", "الكويت", "الكويت", "Kuwait"),
  A("DOH", "الدوحة", "قطر", "Doha"),
  A("BAH", "المنامة", "البحرين", "Bahrain Manama"),
  A("MCT", "مسقط", "عُمان", "Muscat"),
  A("SLL", "صلالة", "عُمان", "Salalah"),

  // Arab world
  A("AMM", "عمّان", "الأردن", "Amman"),
  A("AQJ", "العقبة", "الأردن", "Aqaba"),
  A("BEY", "بيروت", "لبنان", "Beirut"),
  A("DAM", "دمشق", "سوريا", "Damascus"),
  A("BGW", "بغداد", "العراق", "Baghdad"),
  A("BSR", "البصرة", "العراق", "Basra"),
  A("EBL", "أربيل", "العراق", "Erbil"),
  A("NJF", "النجف", "العراق", "Najaf"),
  A("ADE", "عدن", "اليمن", "Aden"),
  A("SAH", "صنعاء", "اليمن", "Sanaa"),
  A("KRT", "الخرطوم", "السودان", "Khartoum"),
  A("PZU", "بورتسودان", "السودان", "Port Sudan"),
  A("MJI", "طرابلس - معيتيقة", "ليبيا", "Tripoli Mitiga"),
  A("BEN", "بنغازي", "ليبيا", "Benghazi"),
  A("TUN", "تونس", "تونس", "Tunis"),
  A("ALG", "الجزائر", "الجزائر", "Algiers"),
  A("CMN", "الدار البيضاء", "المغرب", "Casablanca"),
  A("RAK", "مراكش", "المغرب", "Marrakech"),
  A("JIB", "جيبوتي", "جيبوتي", "Djibouti"),
  A("MGQ", "مقديشو", "الصومال", "Mogadishu"),

  // Turkey
  A("IST", "إسطنبول", "تركيا", "Istanbul"),
  A("SAW", "إسطنبول - صبيحة", "تركيا", "Istanbul Sabiha Gokcen"),
  A("AYT", "أنطاليا", "تركيا", "Antalya"),
  A("ESB", "أنقرة", "تركيا", "Ankara"),
  A("ADB", "إزمير", "تركيا", "Izmir"),
  A("TZX", "طرابزون", "تركيا", "Trabzon"),

  // Europe
  A("LHR", "لندن - هيثرو", "بريطانيا", "London Heathrow"),
  A("LGW", "لندن - جاتويك", "بريطانيا", "London Gatwick"),
  A("MAN", "مانشستر", "بريطانيا", "Manchester"),
  A("DUB", "دبلن", "أيرلندا", "Dublin"),
  A("CDG", "باريس - شارل ديجول", "فرنسا", "Paris Charles de Gaulle"),
  A("ORY", "باريس - أورلي", "فرنسا", "Paris Orly"),
  A("FRA", "فرانكفورت", "ألمانيا", "Frankfurt"),
  A("MUC", "ميونخ", "ألمانيا", "Munich"),
  A("BER", "برلين", "ألمانيا", "Berlin"),
  A("DUS", "دوسلدورف", "ألمانيا", "Dusseldorf"),
  A("HAM", "هامبورج", "ألمانيا", "Hamburg"),
  A("AMS", "أمستردام", "هولندا", "Amsterdam"),
  A("BRU", "بروكسل", "بلجيكا", "Brussels"),
  A("VIE", "فيينا", "النمسا", "Vienna"),
  A("ZRH", "زيورخ", "سويسرا", "Zurich"),
  A("GVA", "جنيف", "سويسرا", "Geneva"),
  A("FCO", "روما", "إيطاليا", "Rome Fiumicino"),
  A("MXP", "ميلانو", "إيطاليا", "Milan Malpensa"),
  A("MAD", "مدريد", "إسبانيا", "Madrid"),
  A("BCN", "برشلونة", "إسبانيا", "Barcelona"),
  A("LIS", "لشبونة", "البرتغال", "Lisbon"),
  A("ATH", "أثينا", "اليونان", "Athens"),
  A("LCA", "لارنكا", "قبرص", "Larnaca Cyprus"),
  A("CPH", "كوبنهاجن", "الدنمارك", "Copenhagen"),
  A("ARN", "ستوكهولم", "السويد", "Stockholm Arlanda"),
  A("OSL", "أوسلو", "النرويج", "Oslo"),
  A("HEL", "هلسنكي", "فنلندا", "Helsinki"),
  A("PRG", "براج", "التشيك", "Prague"),
  A("BUD", "بودابست", "المجر", "Budapest"),
  A("WAW", "وارسو", "بولندا", "Warsaw"),
  A("OTP", "بوخارست", "رومانيا", "Bucharest"),
  A("SVO", "موسكو", "روسيا", "Moscow Sheremetyevo"),

  // Americas
  A("JFK", "نيويورك - جون كينيدي", "أمريكا", "New York JFK"),
  A("EWR", "نيوآرك", "أمريكا", "Newark New York"),
  A("IAD", "واشنطن", "أمريكا", "Washington Dulles"),
  A("BOS", "بوسطن", "أمريكا", "Boston"),
  A("ORD", "شيكاغو", "أمريكا", "Chicago"),
  A("DTW", "ديترويت", "أمريكا", "Detroit"),
  A("ATL", "أتلانتا", "أمريكا", "Atlanta"),
  A("MIA", "ميامي", "أمريكا", "Miami"),
  A("IAH", "هيوستن", "أمريكا", "Houston"),
  A("DFW", "دالاس", "أمريكا", "Dallas"),
  A("LAX", "لوس أنجلوس", "أمريكا", "Los Angeles"),
  A("SFO", "سان فرانسيسكو", "أمريكا", "San Francisco"),
  A("YYZ", "تورونتو", "كندا", "Toronto"),
  A("YUL", "مونتريال", "كندا", "Montreal"),
  A("YVR", "فانكوفر", "كندا", "Vancouver"),
  A("GRU", "ساو باولو", "البرازيل", "Sao Paulo"),

  // Asia
  A("KHI", "كراتشي", "باكستان", "Karachi"),
  A("LHE", "لاهور", "باكستان", "Lahore"),
  A("ISB", "إسلام آباد", "باكستان", "Islamabad"),
  A("DEL", "دلهي", "الهند", "Delhi"),
  A("BOM", "مومباي", "الهند", "Mumbai"),
  A("DAC", "دكا", "بنجلاديش", "Dhaka"),
  A("CMB", "كولومبو", "سريلانكا", "Colombo"),
  A("MLE", "ماليه", "المالديف", "Male Maldives"),
  A("BKK", "بانكوك", "تايلاند", "Bangkok"),
  A("HKT", "بوكيت", "تايلاند", "Phuket"),
  A("KUL", "كوالالمبور", "ماليزيا", "Kuala Lumpur"),
  A("SIN", "سنغافورة", "سنغافورة", "Singapore"),
  A("CGK", "جاكرتا", "إندونيسيا", "Jakarta"),
  A("DPS", "بالي", "إندونيسيا", "Bali Denpasar"),
  A("MNL", "مانيلا", "الفلبين", "Manila"),
  A("HKG", "هونج كونج", "الصين", "Hong Kong"),
  A("PEK", "بكين", "الصين", "Beijing"),
  A("PVG", "شنغهاي", "الصين", "Shanghai"),
  A("CAN", "جوانزو", "الصين", "Guangzhou"),
  A("ICN", "سول", "كوريا الجنوبية", "Seoul Incheon"),
  A("NRT", "طوكيو - ناريتا", "اليابان", "Tokyo Narita"),
  A("HND", "طوكيو - هانيدا", "اليابان", "Tokyo Haneda"),
  A("TBS", "تبليسي", "جورجيا", "Tbilisi"),
  A("GYD", "باكو", "أذربيجان", "Baku"),

  // Africa
  A("ADD", "أديس أبابا", "إثيوبيا", "Addis Ababa"),
  A("NBO", "نيروبي", "كينيا", "Nairobi"),
  A("EBB", "عنتيبي", "أوغندا", "Entebbe Kampala"),
  A("DAR", "دار السلام", "تنزانيا", "Dar es Salaam"),
  A("ZNZ", "زنجبار", "تنزانيا", "Zanzibar"),
  A("JNB", "جوهانسبرج", "جنوب أفريقيا", "Johannesburg"),
  A("CPT", "كيب تاون", "جنوب أفريقيا", "Cape Town"),
  A("LOS", "لاجوس", "نيجيريا", "Lagos"),
  A("ACC", "أكرا", "غانا", "Accra"),
  A("DSS", "داكار", "السنغال", "Dakar"),
  A("MRU", "موريشيوس", "موريشيوس", "Mauritius"),
  A("SEZ", "سيشل", "سيشل", "Seychelles"),

  // Oceania
  A("SYD", "سيدني", "أستراليا", "Sydney"),
  A("MEL", "ملبورن", "أستراليا", "Melbourne"),
];

/** The text that goes in the field and in the lead, e.g. "جدة (JED)". */
export function airportLabel(a: Airport) {
  return `${a.city} (${a.code})`;
}

// Fold the Arabic letter variants people type interchangeably.
function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "") // tashkeel, tatweel
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[()\-–]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const INDEX = AIRPORTS.map((a) => ({
  airport: a,
  code: a.code.toLowerCase(),
  // City then code first, so a label already in the field ("جدة (JED)") still matches itself.
  text: normalize(`${a.city} ${a.code} ${a.country} ${a.en}`),
}));

export function searchAirports(query: string, limit = 8): Airport[] {
  const q = normalize(query);
  if (!q) return AIRPORTS.slice(0, limit);
  const codeHits: Airport[] = [];
  const startHits: Airport[] = [];
  const otherHits: Airport[] = [];
  for (const { airport, code, text } of INDEX) {
    if (code === q) codeHits.push(airport);
    else if (text.startsWith(q) || text.includes(` ${q}`)) startHits.push(airport);
    else if (text.includes(q)) otherHits.push(airport);
  }
  return [...codeHits, ...startHits, ...otherHits].slice(0, limit);
}
