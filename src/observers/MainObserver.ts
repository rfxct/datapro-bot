import { Routes, type TextChannel } from 'discord.js';
import type SilverClient from '../SilverClient';

import ObserverStructure from '../structures/Observer';

export default class MainObserver extends ObserverStructure {
  constructor(client: SilverClient) {
    super(client);

    void this.watch('onReady', async () => {
      await this.registerCommands();

      const cookieChat = (await this.client.channels.fetch(process.env.COOKIE_CHANNEL_ID)) as TextChannel;

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setInterval(async () => {
        const lastCookie = await cookieChat.messages
          .fetch({
            cache: false,
            limit: 1
          })
          .then((messages) => messages.first()?.content ?? '[]');

        await this.client.dataPro.get('/user_info');

        const invalid = JSON.stringify(this.client.dataPro.currentSession) !== lastCookie;

        if (invalid) {
          await cookieChat.bulkDelete(50);
          await cookieChat.send(JSON.stringify(this.client.dataPro.currentSession));
        }
      }, 20 * 1e3);
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
