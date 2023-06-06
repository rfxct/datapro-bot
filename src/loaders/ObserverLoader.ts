import LoaderStructure from '../structures/Loader';

import type SilverClient from '../SilverClient';
import type ObserverStructure from '../structures/Observer';

import FileSystemUtil from '../utils/FileSystem';

export default class ObserverLoader extends LoaderStructure {
  constructor(client: SilverClient) {
    super(client, {
      important: true
    });
  }

  async load(): Promise<boolean> {
    this.initializeObservers();

    return true;
  }

  initializeObservers(dirPath = 'src/observers'): void {
    void FileSystemUtil.requireRecursevily<ObserverStructure>(
      dirPath,
      [
        async (Observer) => {
          for (const [eventName, eventCallback] of Observer.events) {
            this.client.on(eventName, async (...args) => {
              try {
                await eventCallback(...args);
              } catch (error) {
                this.log.error('An error occurred while executing the "%s" event:', eventName, error, args);
              }
            });
          }
          this.log.success('%s loaded without errors.', Observer.constructor.name);
        },
        [this.client]
      ],
      this.log.error
    );
  }
}
