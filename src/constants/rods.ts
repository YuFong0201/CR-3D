import { RodConfig } from '../types/rod.types';

export const BOARD_MIN = -10;
export const BOARD_MAX = 10;
export const BOARD_SIZE = 20;

export const MYSTERY_COLOR = '#334155'; // 深岩灰
export const MYSTERY_BORDER = '#94A3B8';

export const ROD_CONFIGS: Record<number, RodConfig> = {
  1: {
    length: 1,
    name: '白色 (White)',
    color: '#F8FAFC',
    symbol: 'w',
    tickColor: '#64748B', // 深灰線
  },
  2: {
    length: 2,
    name: '紅色 (Red)',
    color: '#EF4444',
    symbol: 'r',
    tickColor: '#FFFFFF', // 白線
  },
  3: {
    length: 3,
    name: '淺綠色 (Light Green)',
    color: '#4ADE80',
    symbol: 'g',
    tickColor: '#14532D', // 深綠線
  },
  4: {
    length: 4,
    name: '紫色 (Purple)',
    color: '#C084FC',
    symbol: 'p',
    tickColor: '#FFFFFF', // 白線
  },
  5: {
    length: 5,
    name: '黃色 (Yellow)',
    color: '#FACC15',
    symbol: 'y',
    tickColor: '#713F12', // 深棕線
  },
  6: {
    length: 6,
    name: '深綠色 (Dark Green)',
    color: '#15803D',
    symbol: 'd',
    tickColor: '#FFFFFF', // 白線
  },
  7: {
    length: 7,
    name: '黑色 (Black)',
    color: '#1E293B',
    symbol: 'k',
    tickColor: '#E2E8F0', // 淺灰線
  },
  8: {
    length: 8,
    name: '棕色 (Brown)',
    color: '#92400E',
    symbol: 'n',
    tickColor: '#FFFFFF', // 白線
  },
  9: {
    length: 9,
    name: '藍色 (Blue)',
    color: '#2563EB',
    symbol: 'e',
    tickColor: '#FFFFFF', // 白線
  },
  10: {
    length: 10,
    name: '橘色 (Orange)',
    color: '#F97316',
    symbol: 'o',
    tickColor: '#FFFFFF', // 白線
  },
};
