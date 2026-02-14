export type ThemePalette = {
  bg: string;
  bgDeep: string;
  card: string;
  cardAlt: string;
  gold: string;
  goldLight: string;
  green: string;
  orange: string;
  red: string;
  white: string;
  muted: string;
  accent: string;
  purple: string;
  text: string;
  textSec: string;
  border: string;
  phoneBg: string;
  statusBg: string;
  navBg: string;
  starColor: string;
  inputBg: string;
  shadowColor: string;
  checkBg: string;
  bb: (c: string) => string;
  cg: (c: string) => string;
  gc: string;
};

export const themes = {
  dark: {
    bg: '#080E1F',
    bgDeep: '#040812',
    card: '#111936',
    cardAlt: '#172049',
    gold: '#D4A84B',
    goldLight: '#F5D88E',
    green: '#3DDC84',
    orange: '#F59E42',
    red: '#E85D5D',
    white: '#F3EDE0',
    muted: '#7E87AA',
    accent: '#6C7AE0',
    purple: '#A855F7',
    text: '#F3EDE0',
    textSec: '#B8BDDA',
    border: '#222850',
    phoneBg: '#080E1F',
    statusBg: '#000',
    navBg: '#080E1FF2',
    starColor: '#F5D88E',
    inputBg: '#172049',
    shadowColor: '#00000088',
    checkBg: 'transparent',
    bb: (c: string) => `${c}15`,
    cg: (c: string) => `0 4px 32px ${c}12`,
    gc: 'linear-gradient(135deg,#111936,#172049)',
  } as ThemePalette,
  light: {
    bg: '#F7F3EC',
    bgDeep: '#EDE8DF',
    card: '#FFFFFF',
    cardAlt: '#F0EBE2',
    gold: '#B8892A',
    goldLight: '#8B6914',
    green: '#1B9E55',
    orange: '#D4841A',
    red: '#C94444',
    white: '#1A1A2E',
    muted: '#8C8478',
    accent: '#4F5EC0',
    purple: '#7C3AED',
    text: '#1A1A2E',
    textSec: '#5A5347',
    border: '#D6CEBD',
    phoneBg: '#F7F3EC',
    statusBg: '#E8E2D8',
    navBg: '#F7F3ECF5',
    starColor: '#D4A84B44',
    inputBg: '#F0EBE2',
    shadowColor: '#00000018',
    checkBg: '#F0EBE2',
    bb: (c: string) => `${c}18`,
    cg: (c: string) => `0 4px 24px ${c}15`,
    gc: 'linear-gradient(135deg,#FFFFFF,#F8F4ED)',
  } as ThemePalette,
};

export const fontArabic = `'Amiri','Noto Naskh Arabic',serif`;
export const fontSans = `'Noto Sans Arabic','Tajawal',sans-serif`;
