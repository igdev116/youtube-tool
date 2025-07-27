export enum Breakpoint {
  'None' = '0',
  'SM' = '640',
  'MD' = '768',
  'LG' = '1024',
  'XL' = '1280',
  '2XL' = '1536',
}

export const MAX_CODE_LENGTH = 6;

export const ROUTES = {
  HOME: '/',
  LOGIN: {
    INDEX: '/login',
  },
  REGISTER: {
    INDEX: '/register',
  },
  APP: {
    INDEX: '/app',
  },
};

export const LS_KEYS = {
  ACCESS_TOKEN: 'accessToken',
};

export const TOOLTIP_MESSAGES = {
  CHECK_LINK_ERROR: 'Vui lòng check lại link kênh',
  ADD_TELEGRAM_GROUP: 'Vui lòng thêm nhóm Telegram',
} as const;
