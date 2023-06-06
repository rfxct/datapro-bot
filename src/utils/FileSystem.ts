import * as fs from 'fs/promises';
import path from 'path';
import type SilverClient from '../SilverClient';

const ALLOWED_EXT = /\.(ts|js(on)?)$/;

const FileSystemUtil = class {
  async requireRecursevily<Structure>(
    dirPath: string,
    [successCallback, instanceParams]: [
      (instance: Structure, fileName: string) => unknown,
      [client: SilverClient] | undefined
    ],
    error: (error: unknown) => void,
    recursive = true
  ): Promise<Record<string, Structure>> {
    const files = await fs.readdir(dirPath);
    const filesObject: Record<string, Structure> = {};

    const queue = files.map(async (fileName) => {
      const fullPath = path.resolve(dirPath, fileName);

      if (ALLOWED_EXT.test(fileName)) {
        try {
          const Required = await import(fullPath).then((i) => i.default);
          const instance: Structure = instanceParams === undefined ? Required : new Required(...instanceParams);

          if (successCallback != null) await successCallback(instance, fileName);
          filesObject[fileName] = instance;

          return instance;
        } catch (e) {
          error(e);
        }
      } else if (recursive) {
        const isDirectory = await fs.stat(fullPath).then((f) => f.isDirectory());
        if (isDirectory) {
          return await this.requireRecursevily<Structure>(fullPath, [successCallback, instanceParams], error);
        }
      }
    });

    return await Promise.all(queue)
      .then(() => filesObject)
      .catch((e) => {
        console.error(e);

        return {};
      });
  }
};

export default new FileSystemUtil();
