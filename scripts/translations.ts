/**
 * Translation Dictionary for Technical Terms
 * 
 * This file contains English to Turkish translations for common boiler/heating terms.
 * You can expand this dictionary or integrate with an AI translation API.
 */

export const technicalTerms: Record<string, string> = {
  // Common fault terms
  'Ignition failure': 'Ateşleme hatası',
  'boiler fails to ignite': 'kazan ateşlenemiyor',
  'Low water pressure': 'Düşük su basıncı',
  'High pressure': 'Yüksek basınç',
  'Overheating': 'Aşırı ısınma',
  'Flame detection': 'Alev algılama',
  'Fan fault': 'Fan arızası',
  'Pump fault': 'Pompa arızası',
  'Temperature sensor': 'Sıcaklık sensörü',
  'Pressure sensor': 'Basınç sensörü',
  'Circuit board': 'Devre kartı',
  'Gas valve': 'Gaz valfi',
  'Air pressure switch': 'Hava basınç anahtarı',
  'Condensate trap': 'Kondensat tuzağı',
  
  // Common causes
  'Gas supply issue': 'Gaz besleme sorunu',
  'gas valve closed': 'gaz valfi kapalı',
  'Faulty ignition electrode': 'Arızalı ateşleme elektrotu',
  'Air in gas line': 'Gaz hattında hava',
  'Low gas pressure': 'Düşük gaz basıncı',
  'Blocked flue': 'Tıkalı baca',
  'condensate pipe': 'kondensat borusu',
  'Water leak': 'Su kaçağı',
  'pressure relief valve': 'basınç tahliye valfi',
  'Expansion vessel': 'Genleşme tankı',
  'bleeding radiators': 'radyatör havalandırma',
  'Faulty PCB': 'Arızalı devre kartı',
  'Faulty fan': 'Arızalı fan',
  'Fan not running': 'Fan çalışmıyor',
  'Blocked air intake': 'Tıkalı hava girişi',
  'Faulty pressure switch': 'Arızalı basınç anahtarı',
  'Condensate trap blocked': 'Kondensat tuzağı tıkalı',
  
  // Common actions
  'Check': 'Kontrol edin',
  'Inspect': 'İnceleyin',
  'Replace': 'Değiştirin',
  'Clean': 'Temizleyin',
  'Reset': 'Sıfırlayın',
  'Call': 'Arayın',
  'Contact': 'İletişime geçin',
  'Turn off': 'Kapatın',
  'Turn on': 'Açın',
  'Press': 'Basın',
  'Wait': 'Bekleyin',
  'Listen': 'Dinleyin',
  
  // Safety terms
  'Gas Safe registered engineer': 'Yetkili gaz teknisyeni',
  'immediately': 'hemen',
  'Warning': 'Uyarı',
  'Caution': 'Dikkat',
  'Do not attempt': 'Denemeyin',
  'Professional required': 'Profesyonel gerekli',
  
  // Tools
  'Screwdriver': 'Tornavida',
  'Multimeter': 'Multimetre',
  'Pressure gauge': 'Basınç göstergesi',
  'Adjustable wrench': 'Ayarlanabilir anahtar',
  'Pipe wrench': 'Boru anahtarı',
  'Flashlight': 'El feneri',
  'Ladder': 'Merdiven',
  'Bucket': 'Kova',
  'Towels': 'Havlular',
  'Wire brush': 'Tel fırça',
  'Vacuum cleaner': 'Elektrik süpürgesi',
  'Spark gap tool': 'Buji aralığı aleti',
  
  // Time units
  'minutes': 'dakika',
  'hours': 'saat',
  
  // Common phrases
  'The boiler': 'Kazan',
  'the system': 'sistem',
  'water pressure': 'su basıncı',
  'heating system': 'ısıtma sistemi',
  'central heating': 'merkezi ısıtma',
  'hot water': 'sıcak su',
  'radiators': 'radyatörler',
  'thermostat': 'termostat',
};

/**
 * Simple rule-based translator
 * Attempts to translate using the dictionary, falls back to original text
 */
export function simpleTranslate(text: string): string {
  let translated = text;
  
  // Replace known terms (case-insensitive)
  for (const [en, tr] of Object.entries(technicalTerms)) {
    const regex = new RegExp(en, 'gi');
    translated = translated.replace(regex, tr);
  }
  
  return translated;
}

/**
 * Translates an array of strings
 */
export function translateArray(items: string[]): string[] {
  return items.map(item => simpleTranslate(item));
}

/**
 * Creates a bilingual JSONB object
 */
export function createBilingualText(englishText: string): { en: string; tr: string } {
  return {
    en: englishText,
    tr: simpleTranslate(englishText),
  };
}

/**
 * Creates a bilingual JSONB array
 */
export function createBilingualArray(englishArray: string[]): { en: string[]; tr: string[] } {
  return {
    en: englishArray,
    tr: translateArray(englishArray),
  };
}

/**
 * AI Translation Helper (Placeholder)
 * 
 * To use AI translation (e.g., OpenAI GPT-4):
 * 1. Install: yarn add openai
 * 2. Set OPENAI_API_KEY in .env
 * 3. Uncomment and use this function
 */
/*
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function aiTranslate(text: string, context?: string): Promise<string> {
  try {
    const prompt = context
      ? `Translate the following boiler/heating technical text from English to Turkish. Context: ${context}\n\nText: ${text}`
      : `Translate the following boiler/heating technical text from English to Turkish:\n\n${text}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a technical translator specializing in HVAC and boiler terminology. Provide accurate Turkish translations for heating system fault codes and repair instructions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
    });
    
    return response.choices[0].message.content?.trim() || text;
  } catch (error) {
    console.error('AI translation failed:', error);
    return simpleTranslate(text); // Fallback to simple translation
  }
}
*/

