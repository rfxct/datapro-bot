import { type ChatInputCommandInteraction, bold, inlineCode } from 'discord.js';

import type SilverClient from '../SilverClient';

import CommandStructure from '../structures/Command';
import CustomEmbedBuilder from '../structures/Embed';

export default class PingCommand extends CommandStructure {
  constructor(client: SilverClient) {
    super(client, {
      name: 'ping',
      description: 'Informa a latência do bot'
    });
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const sentAt = Date.now();

    await interaction.deferReply({ ephemeral: true });

    const embed = new CustomEmbedBuilder() //
      .setMultilineDescription(
        `🏓 ${bold('Websocket')}: ${inlineCode(`${this.client.ws.ping} ms`)}`,
        `🤖 ${bold('Bot')}: ${inlineCode(`${Math.ceil(Date.now() - sentAt)} ms`)}`
      );

    await interaction.editReply({ embeds: [embed] });
  }
}
