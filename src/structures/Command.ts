import type {
  ApplicationCommandOptionBase,
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  InteractionResponse,
  Message,
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  SlashCommandUserOption
} from 'discord.js';

import { ApplicationCommandType } from 'discord.js';

import { DEFAULT_EMBED_ERROR_COLOR } from '../properties';
import type SilverClient from '../SilverClient';

import OptionHandler from '../utils/OptionHandler';
import CommandError from './CommandError';
import CustomEmbedBuilder from './Embed';

interface CommandParamStringOption extends SlashCommandStringOption {
  type: ApplicationCommandOptionType.String;
}

interface CommandParamIntegerOption extends SlashCommandIntegerOption {
  type: ApplicationCommandOptionType.Integer;
}
interface CommandParamBooleanOption extends SlashCommandBooleanOption {
  type: ApplicationCommandOptionType.Boolean;
}

interface CommandParamUserOption extends SlashCommandUserOption {
  type: ApplicationCommandOptionType.User;
}

interface CommandParamChannelOption extends SlashCommandChannelOption {
  type: ApplicationCommandOptionType.Channel;
}

interface CommandParamRoleOption extends SlashCommandRoleOption {
  type: ApplicationCommandOptionType.Role;
}

interface CommandParamMentionableOption extends SlashCommandMentionableOption {
  type: ApplicationCommandOptionType.Mentionable;
}

interface CommandParamNumberOption extends SlashCommandNumberOption {
  type: ApplicationCommandOptionType.Number;
}

interface CommandParamAttachmentOption extends SlashCommandAttachmentOption {
  type: ApplicationCommandOptionType.Attachment;
}

type CommandParamOption = NonFunctionProperties<
  (
    | CommandParamAttachmentOption
    | CommandParamBooleanOption
    | CommandParamChannelOption
    | CommandParamIntegerOption
    | CommandParamMentionableOption
    | CommandParamNumberOption
    | CommandParamRoleOption
    | CommandParamStringOption
    | CommandParamUserOption
  ) &
    ApplicationCommandOptionBase & {
      autocomplete?: boolean;
    }
>;

interface CommandOptions {
  parentCommand?: CommandStructure | string | null;

  name: string;
  description: string;
  params?: CommandParamOption[];
}

export interface CommandTemplate extends CommandOptions {
  client: SilverClient;

  run: (interaction: ChatInputCommandInteraction) => void | Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
}

export default abstract class CommandStructure implements CommandTemplate {
  public parentCommand?: string | CommandStructure | null;

  public name: string;
  public description: string;
  public params: CommandParamOption[] = [];

  public subcommands: CommandStructure[] = [];

  constructor(public client: SilverClient, opts: CommandOptions) {
    const options = OptionHandler.create('Command', opts);

    this.parentCommand = options.optional('parentCommand', null);

    this.name = options.required('name');
    this.description = options.required('description');
    this.params = options.optional('params', []);
  }

  get slashData(): {
    type: ApplicationCommandType;
    name: string;
    description: string;
    options: CommandParamOption[];
  } {
    if (this.subcommands.length > 0) {
      const rawData = this.subcommands.map((sc) => sc.slashData) as unknown as CommandParamOption[];
      this.params.push(...rawData);
    }

    return {
      type: ApplicationCommandType.ChatInput,
      name: this.name,
      description: this.description,
      options: this.params
    };
  }

  async runSafe(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await this.run(interaction);
    } catch (e) {
      await this.error(interaction, e as never);
    }
  }

  error(
    interaction: ChatInputCommandInteraction,
    error: InstanceType<typeof CommandError> | never
  ): Promise<Message | InteractionResponse> | undefined {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    if (error instanceof CommandError || error['code'] === 'CommandInteractionOptionNotFound') {
      const embed = new CustomEmbedBuilder().setTitle(error.message).parseAndSetColor(DEFAULT_EMBED_ERROR_COLOR);
      const response = { embeds: [embed] };

      return interaction.deferred ? interaction.editReply(response) : interaction.reply(response);
    }

    console.error(error);
  }

  abstract run(interaction: ChatInputCommandInteraction): void | Promise<void>;
  autocomplete(interaction: AutocompleteInteraction): void {
    ('');
  }
}
