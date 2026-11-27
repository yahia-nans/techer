import { ActionId, Language } from '../data/scenarios';

export interface ParsedIntentResult {
  detectedLang: Language;
  intents: ActionId[];
  matchedKeywords: string[];
}

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // Strip diacritics / tashkeel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

function normalizeInput(raw: string): string {
  return normalizeArabic(raw)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectTextLanguage(raw: string, fallback: Language): Language {
  if (/[\u0600-\u06FF]/.test(raw)) return 'ar';
  if (/[a-zA-Z]/.test(raw)) return 'en';
  return fallback;
}

interface IntentRule {
  id: ActionId;
  patterns: string[];
}

const INTENT_RULES: IntentRule[] = [
  {
    id: 'deescalate',
    patterns: [
      // Egyptian Arabic slang & polite phrases
      'معلش',
      'حقك عليا',
      'حقك علينا',
      'بعتذر',
      'اعتذر',
      'اسف',
      'متاسف',
      'اهدي',
      'هدي',
      'متزعلش',
      'متتعصبش',
      'حاضر',
      'تحت امرك',
      'من عيني',
      'عيني ليك',
      'هحلها',
      'هحلهالك',
      'متقلقش',
      'فاهمك',
      'مقدر',
      // English
      'sorry',
      'apologize',
      'apology',
      'calm down',
      'understand',
      'frustration',
      'right away',
      'bear with me',
      'no worries',
      'stay with you',
    ],
  },
  {
    id: 'ask_id',
    patterns: [
      'رقم قومي',
      'الرقم القومي',
      'قومي',
      'بطاقه',
      'البطاقه',
      'اربعه عشر',
      '14 رقم',
      'رقم الحساب',
      'كود العميل',
      'بياناتك',
      'الرقم',
      'national id',
      'id number',
      '14 digits',
      'fourteen',
      'account number',
      'verify account',
      'your id',
    ],
  },
  {
    id: 'restart_router',
    patterns: [
      'رستر',
      'راستر',
      'ريستارت',
      'اطفي الراوتر',
      'اطفي',
      'اقفل الراوتر',
      'اقفل',
      'شغل الراوتر',
      'شغله تاني',
      'افصل الكهربا',
      'افصل الفيشه',
      'شيل الفيشه',
      'عشر ثواني',
      '10 ثواني',
      'اعاده تشغيل',
      'نطفي الراوتر',
      'ترستر',
      'restart',
      'reboot',
      'unplug',
      'power cycle',
      'turn off',
      'turn it off',
      '10 seconds',
      'ten seconds',
      'plug back',
    ],
  },
  {
    id: 'check_line',
    patterns: [
      'افحص الخط',
      'فحص الخط',
      'فحص',
      'الخط',
      'السيجنال',
      'الاشاره',
      'تشويش',
      'لمبه حمراء',
      'لمبه حمرا',
      'احمر',
      'los',
      'snr',
      'السنترال',
      'check line',
      'line check',
      'diagnostics',
      'diagnostic',
      'signal',
      'attenuation',
      'red light',
      'blinking',
      'scan',
    ],
  },
  {
    id: 'reset_port',
    patterns: [
      'تنشيط البورت',
      'تحديث البورت',
      'بورت',
      'البورت',
      'ريسيت',
      'اعاده بناء',
      'البينج',
      'البنج',
      'reset port',
      'refresh port',
      'port reset',
      'dslam',
      'fix ping',
      'rebuild port',
    ],
  },
  {
    id: 'explain_billing',
    patterns: [
      'الفاتوره',
      'فاتوره',
      'الباقه',
      'باقه',
      'الرصيد',
      'دفع',
      'فوري',
      'مراجعه',
      'الاستهلاك',
      'جيجا',
      'جيجات',
      'اشتراك',
      'خلصت',
      'تجديد',
      'bill',
      'billing',
      'invoice',
      'payment',
      'paid',
      'fawry',
      'package',
      'quota',
      'usage',
      'gigabyte',
      'renew',
      'overdue',
    ],
  },
  {
    id: 'dispatch_tech',
    patterns: [
      'فني',
      'مهندس',
      'صيانه',
      'تحويل',
      'تصعيد',
      'زياره',
      'سلك مقطوع',
      'السلك الخارجي',
      'كابينه',
      'تيكت',
      'بلاغ',
      'technician',
      'dispatch',
      'escalate',
      'escalation',
      'field visit',
      'engineer',
      'cable cut',
      'fiber cut',
      'ticket',
    ],
  },
  {
    id: 'polite_close',
    patterns: [
      'شكرا',
      'مع السلامه',
      'بالسلامه',
      'في رعايه الله',
      'انهاء',
      'اقفل المكالمه',
      'تم الحل',
      'مشكله اتحلت',
      'نهارك سعيد',
      'يومك سعيد',
      'thank you',
      'thanks',
      'goodbye',
      'bye',
      'wrap up',
      'close ticket',
      'all set',
      'have a great day',
    ],
  },
];

export function parseSpeechIntent(rawText: string, uiLang: Language): ParsedIntentResult {
  const detectedLang = detectTextLanguage(rawText, uiLang);
  const normalized = normalizeInput(rawText);

  if (!normalized) {
    return { detectedLang, intents: [], matchedKeywords: [] };
  }

  const intents: ActionId[] = [];
  const matchedKeywords: string[] = [];

  for (const rule of INTENT_RULES) {
    for (const pattern of rule.patterns) {
      const normPattern = normalizeInput(pattern);
      if (!normPattern) continue;

      // Match whole word/phrase cleanly for short ascii tokens like 'los', otherwise substring match works great for Arabic prefixes
      const isShortAscii = /^[a-z0-9]{2,4}$/.test(normPattern);
      const matched = isShortAscii
        ? new RegExp(`\\b${normPattern}\\b`, 'i').test(normalized)
        : normalized.includes(normPattern);

      if (matched) {
        if (!intents.includes(rule.id)) {
          intents.push(rule.id);
        }
        matchedKeywords.push(pattern);
        break;
      }
    }
  }

  return { detectedLang, intents, matchedKeywords };
}
