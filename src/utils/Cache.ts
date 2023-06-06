/* eslint-disable @typescript-eslint/no-explicit-any */

import nconf, { type Provider as NconfProvider, type ICallbackFunction } from 'nconf';
import fs from 'fs';

export default class CacheUtil {
  private readonly storageName: string;
  private readonly storage: NconfProvider;

  constructor(storageName?: string) {
    if (!fs.existsSync('cache')) fs.mkdirSync('cache');

    this.storageName = storageName ?? 'global';

    this.storage = nconf.file({ file: `cache/${this.storageName}` });
  }

  get(key: string, callback?: ICallbackFunction): any {
    return this.storage.get(key, callback);
  }

  set(key: string, value: any, callback?: ICallbackFunction): [any, any] {
    return [this.storage.set(key, value), this.storage.save(callback)];
  }
}
