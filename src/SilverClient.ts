import { Client } from 'discord.js';
import type { ClientOptions } from 'discord.js';

import { Signale } from 'signale';
import { DEFAULT_SIGNALE_CONFIG } from './properties';

import type CommandStructure from './structures/Command';
import type LoaderStructure from './structures/Loader';

import FileSystemUtil from './utils/FileSystem';
import DataProApi from './apis/DataPro';

export default class SilverClient extends Client {
  public log: Signale;
  public dataPro: DataProApi;
  public commands: CommandStructure[];

  constructor(options: ClientOptions) {
    super(options);

    this.log = new Signale({ config: DEFAULT_SIGNALE_CONFIG, scope: this.constructor.name });
    this.commands = [];

    this.dataPro = new DataProApi(this);
  }

  async start(token = process.env.APPLICATION_TOKEN): Promise<void> {
    try {
      await this.initializeLoaders();

      await this.login(token);
      this.log.success('Logged in successfully!');
    } catch {
      this.log.error('An invalid token was provided');
    }
  }

  async wait(ms: number): Promise<unknown> {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async initializeLoaders(
    dirPath = 'src/loaders'
  ): Promise<ReturnType<typeof FileSystemUtil.requireRecursevily<LoaderStructure>>> {
    return await FileSystemUtil.requireRecursevily<LoaderStructure>(
      dirPath,
      [
        async (loader) => {
          let success = false;

          try {
            success = await loader.load();
          } catch (e) {
            console.error(e);
          } finally {
            if (!success && loader.important) process.exit(1);
          }
        },
        [this]
      ],
      console.error
    );
  }
}
