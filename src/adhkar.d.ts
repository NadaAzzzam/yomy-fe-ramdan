// Type declarations for JSON imports
declare module "*.json" {
  const value: {
    morning: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    evening: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    afterPrayer: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    beforeSleep: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    uponWaking: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    enteringHome: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    leavingHome: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    enteringMosque: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    leavingMosque: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    beforeEating: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    afterEating: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    beforeWudu: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    afterWudu: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    enteringBathroom: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
    leavingBathroom: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
      type?: "quran" | "dhikr";
    }>;
  };
  export default value;
}
