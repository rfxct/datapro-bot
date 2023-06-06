import { type ChatInputCommandInteraction, TextInputStyle } from 'discord.js';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from '@discordjs/builders';

import type SilverClient from '../SilverClient';
import CommandStructure from '../structures/Command';

export default class TrackerMasterCommand extends CommandStructure {
  constructor(client: SilverClient) {
    super(client, {
      name: 'buscaavancada',
      description: 'MÓDULO BUSCA AVANÇADA'
    });
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = new ModalBuilder() //
      .setCustomId('data-pro/buscaavancada_cpfapi')
      .setTitle(this.description);

    const cpfRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder() //
        .setCustomId('cpf')
        .setLabel('CPF')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
    );
    const cnpjRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder() //
        .setCustomId('cnpj')
        .setLabel('CNPJ')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
    );

    const telRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder() //
        .setCustomId('tel')
        .setLabel('Telefone')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
    );

    const emailRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      new TextInputBuilder() //
        .setCustomId('email')
        .setLabel('E-mail')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
    );

    modal.addComponents(telRow, cpfRow, cnpjRow, emailRow);

    await interaction.showModal(modal);
  }
}
