import type CustomEmbedBuilder from './Embed';

export default class CommandError extends Error {
  public embed: CustomEmbedBuilder | null;

  constructor(message: string) {
    super(typeof message === 'object' ? 'EMBED_ERROR' : message);
    this.embed = null;
  }
}
