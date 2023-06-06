declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APPLICATION_TOKEN: string;
      DEFAULT_EMBED_COLOR: string;

      SENTRY_DSN: string;
      API_KEY_2CAPTCHA: string;

      DATA_PRO_USERNAME: string;
      DATA_PRO_PASSWORD: string;

      COOKIE_GUILD_ID: string;
      COOKIE_CHANNEL_ID: string;
    }
  }

  type NonFunctionPropertyNames<T> = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K in keyof T]: T[K] extends Function ? never : K;
  }[keyof T];

  type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
}

export {};
