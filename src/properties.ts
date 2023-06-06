import type { SignaleConfig } from 'signale';

export const DEFAULT_EMBED_COLOR = process.env.DEFAULT_EMBED_COLOR ?? '2f3136';
export const DEFAULT_EMBED_ERROR_COLOR = process.env.DEFAULT_EMBED_ERROR_COLOR ?? 'ff0000';
export const DEFAULT_SIGNALE_CONFIG: SignaleConfig = {
  displayTimestamp: true,
  displayFilename: true
};

export const COOKIE_TEXT_CHANNEL = '1115339532942966886';
