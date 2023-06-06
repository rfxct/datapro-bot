import { type ChatInputCommandInteraction } from 'discord.js';

import type SilverClient from '../SilverClient';
import CommandStructure from '../structures/Command';

export default class CurrentSessionCommand extends CommandStructure {
  constructor(client: SilverClient) {
    super(client, {
      name: 'current-session',
      description: 'Pega a sessão atual do bot'
    });
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    await this.client.dataPro.get('/user_info');

    void interaction.editReply({ content: JSON.stringify(this.client.dataPro.currentSession) });
  }
}
