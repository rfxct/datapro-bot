import { Routes, type TextChannel } from 'discord.js';
import type SilverClient from '../SilverClient';

import ObserverStructure from '../structures/Observer';
import { type Protocol } from 'puppeteer';

export default class MainObserver extends ObserverStructure {
  constructor(client: SilverClient) {
    super(client);

    void this.watch('onReady', async () => {
      await this.registerCommands();

      const cookieChat = (await this.client.channels.fetch(process.env.COOKIE_CHANNEL_ID)) as TextChannel;

      let fetchingNew = false;

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setInterval(async () => {
        if (fetchingNew) return;

        const lastCookies = await cookieChat.messages
          .fetch({
            cache: false,
            limit: 1
          })
          .then((messages) => messages.first()?.content ?? '[]')
          .then((content) => JSON.parse(content) as Protocol.Network.Cookie[]);

        const valid = lastCookies.some((c) => c.name === 'sessionid' && c.expires - Date.now() / 1e3 >= 60 * 7);

        if (!valid && !fetchingNew) {
          fetchingNew = true;
          await this.client.dataPro.regenerateAccessCookies();
          fetchingNew = false;

          await cookieChat.bulkDelete(50);
          await cookieChat.send(JSON.stringify(this.client.dataPro.currentSession));
        }
      }, 2 * 1e3);
    });
  }

  async registerCommands(): Promise<void> {
    const remoteCommands = await this.client.application?.commands.fetch();
    const registerAgain = this.client.commands.some(
      (localCommand) =>
        remoteCommands?.find(
          (remoteCommand) =>
            remoteCommand.name === localCommand.name && remoteCommand.description === localCommand.description
        ) == null
    );

    if (registerAgain) {
      const commands = this.client.commands.map((c) => c.slashData);

      const clientId = Buffer.from(process.env.APPLICATION_TOKEN.split('.')[0], 'base64').toString();
      await this.client.rest.put(Routes.applicationCommands(clientId), {
        body: commands
      });

      this.client.log.success('All %d new slash commands registered without errors.', commands.length);
    }
  }
}
