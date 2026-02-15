// Type declarations for JSON imports
declare module "*.json" {
  const value: {
    morning: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
    evening: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
    afterPrayer: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
    beforeSleep: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
    uponWaking: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
    enteringHome: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
    leavingHome: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
    enteringMosque: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
    leavingMosque: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
    beforeEating: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
    afterEating: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
    beforeWudu: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
    afterWudu: Array<{
      arabic: string;
      transliteration: string;
      meaning: string;
      source: string;
      repetition: number;
    }>;
  };
  export default value;
}
