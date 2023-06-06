import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction
} from 'discord.js';

import type SilverClient from '../SilverClient';
import CommandStructure from '../structures/Command';

export default class BuscaNomeCommand extends CommandStructure {
  constructor(client: SilverClient) {
    super(client, {
      name: 'nomex',
      description: 'MÓDULO BUSCA NOME FULL',
      params: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'nome',
          description: 'Nome a ser consultado',
          required: true
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'nome_mae',
          description: 'Nome da mãe',
          required: false
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'nasc',
          description: 'Data de nascimento',
          required: false
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'cidade',
          description: 'Cidade',
          autocomplete: true,
          required: false
        }
      ]
    });
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const payloadEntries = interaction.options.data.map((field) => [field.name, field.value]);

    const result = await this.client.dataPro.post('/buscanome_cpfapi', Object.fromEntries(payloadEntries));

    const json = JSON.stringify(result.data, null, 2);
    const file = new AttachmentBuilder(Buffer.from(json), { name: Date.now().toString(36) + '.txt' });

    void interaction.editReply({ files: [file] });

    // const embed = new CustomEmbedBuilder().addFields([
    //   { name: 'nome', value: nome, inline: true },
    //   { name: 'nome_mae', value: mae, inline: true },
    //   { name: 'nasc', value: nasc, inline: true },
    //   { name: 'cidade', value: cidade, inline: true },
    // ]);

    // await interaction.editReply({ embeds: [embed] });
  }

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const cityToSearch = interaction.options.getFocused();

    const { data: cities } = await this.client.dataPro.get('/search_cidades', {
      params: { q: cityToSearch }
    });

    const filtered = cities.result.map((city: { id: number; cidade: string; cidade_full: string }) => ({
      name: city.cidade_full,
      value: city.cidade
    }));

    await interaction.respond(filtered);
  }
}
