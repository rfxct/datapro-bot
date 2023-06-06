import { AttachmentBuilder, type AutocompleteInteraction, type ChatInputCommandInteraction } from 'discord.js';

import type SilverClient from '../SilverClient';
import ObserverStructure from '../structures/Observer';
import type CommandStructure from '../structures/Command';

export default class InteractionObserver extends ObserverStructure {
  constructor(client: SilverClient) {
    super(client);

    void this.watch('onInteractionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.findCommandByInteraction(interaction);
      if (command != null) {
        await command.runSafe(interaction);
      }
    });

    void this.watch('onInteractionCreate', (interaction) => {
      if (!interaction.isAutocomplete()) return;

      const command = this.findCommandByInteraction(interaction);
      if (command != null) {
        command.autocomplete(interaction);
      }
    });

    void this.watch('onInteractionCreate', async (interaction) => {
      if (!interaction.isModalSubmit() || !interaction.customId.startsWith('data-pro/')) return;

      const payloadEntries = interaction.fields.fields.toJSON().map((field) => [field.customId, field.value]);

      const result = await this.client.dataPro.post(
        interaction.customId.replace('data-pro/', ''),
        Object.fromEntries(payloadEntries)
      );

      const json = JSON.stringify(result.data, null, 2);
      const file = new AttachmentBuilder(Buffer.from(json), { name: Date.now().toString(36) + '.txt' });

      void interaction.reply({ files: [file] });
    });
  }

  findCommandByInteraction(
    interaction: AutocompleteInteraction | ChatInputCommandInteraction
  ): CommandStructure | undefined {
    const parent = this.client.commands.find((c) => c.name === interaction.commandName);
    const subcommandName = interaction.options.getSubcommand(false);

    return parent != null && subcommandName != null
      ? parent.subcommands.find((s) => s.name === subcommandName)
      : parent;
  }
}
