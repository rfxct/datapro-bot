import { Signale, type SignaleOptions } from 'signale';
import { DEFAULT_SIGNALE_CONFIG } from '../properties';

import type SilverClient from '../SilverClient';
import OptionHandler from '../utils/OptionHandler';

interface ILoaderOptions {
  important?: boolean;
  signale?: SignaleOptions;
}

export interface ILoaderTemplate extends ILoaderOptions {
  client: SilverClient;
  important: boolean;

  load: () => Promise<boolean>;
}

export default abstract class LoaderStructure implements ILoaderTemplate {
  public important;
  public log;

  constructor(public client: SilverClient, opts: ILoaderOptions = {}) {
    const options = OptionHandler.create('Loader', opts);

    this.important = options.optional('important', false);
    this.log = new Signale({ scope: this.constructor.name, config: DEFAULT_SIGNALE_CONFIG, ...opts.signale });
  }

  abstract load(): Promise<boolean>;
}
