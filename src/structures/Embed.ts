import { EmbedBuilder } from '@discordjs/builders';

import type { APIEmbed, User } from 'discord.js';
import type { RGBTuple } from '@discordjs/builders';

import { DEFAULT_EMBED_COLOR } from '../properties';

export default class CustomEmbedBuilder extends EmbedBuilder {
  constructor(author?: User, data?: APIEmbed) {
    super(data);

    if (author != null)
      this.setFooter({
        text: author.tag
      });

    this.parseAndSetColor(DEFAULT_EMBED_COLOR);
  }

  setMultilineDescription(...blocks: string[]): this {
    return this.setDescription(blocks.join('\n'));
  }

  parseAndSetColor(color: number | RGBTuple | string): this {
    if (typeof color === 'string') {
      color = parseInt(color.replace(/[^a-z0-9]/g, ''), 16);
    }

    return this.setColor(color);
  }
}
