import type SilverClient from '../SilverClient';

import CommandStructure from '../structures/Command';
import LoaderStructure from '../structures/Loader';

import FileSystemUtil from '../utils/FileSystem';

export default class CommandLoader extends LoaderStructure {
  private commands: CommandStructure[] = [];
  private readonly subcommands: CommandStructure[] = [];

  constructor(client: SilverClient) {
    super(client, {
      important: true
    });
  }

  async load(): Promise<boolean> {
    await this.initializeCommands();

    this.client.commands = this.commands;
    return true;
  }

  async initializeCommands(dirPath = 'src/commands'): Promise<void> {
    let success = 0;
    let fail = 0;

    await FileSystemUtil.requireRecursevily<CommandStructure>(
      dirPath,
      [(command, fileName) => (this.addCommand(command, fileName) ? success++ : fail++), [this.client]],
      this.log.error
    ).then(() => {
      this.subcommands.forEach((subcommand) => this.addSubcommand(subcommand));

      if (fail > 0) this.log.warn('%d commands loaded, %d failed', success, fail);
      else this.log.success('All %d commands loaded without errors.', success);
    });
  }

  addCommand(command: CommandStructure, fileName: string): boolean {
    if (!(command instanceof CommandStructure)) {
      this.log.error('The file "%s" isn\'t a valid command', fileName);

      return false;
    }

    if (command.parentCommand !== null) {
      this.subcommands.push(command);
    } else {
      this.commands.push(command);
    }

    return true;
  }

  addSubcommand(subCommand: CommandStructure): boolean {
    let parentCommand;
    if (typeof subCommand.parentCommand === 'string') {
      parentCommand = this.commands.find((c) => c.name === subCommand.parentCommand);
    }

    if (parentCommand != null) {
      parentCommand.subcommands.push(subCommand);
      subCommand.parentCommand = parentCommand;
    } else {
      parentCommand = subCommand.parentCommand as string;
      const name = [parentCommand, subCommand.name].flat(2).join(' ');
      this.log.error("%s failed to load - Couldn't find parent command.", name);
      return false;
    }

    return true;
  }
}
