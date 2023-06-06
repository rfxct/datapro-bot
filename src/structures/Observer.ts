import { type Awaitable, type ClientEvents as RawClientEvents } from 'discord.js';
import type SilverClient from '../SilverClient';

type RenameClientEvents<CE> = {
  [K in keyof CE as `on${Capitalize<string & K>}`]: CE[K];
};

type ClientEvents = RenameClientEvents<RawClientEvents>;

type EventCallback<EventName extends keyof ClientEvents> = (...args: ClientEvents[EventName]) => Awaitable<void>;

type EventsCollection<K extends keyof RawClientEvents> = Array<[K, (...args: RawClientEvents[K]) => Awaitable<void>]>;

export interface ObserverTemplate {
  client: SilverClient;
  events: EventsCollection<keyof RawClientEvents>;

  watch: <EventName extends keyof ClientEvents>(
    event: EventName,
    callback: EventCallback<EventName>
  ) => Awaitable<void>;
}

export default abstract class ObserverStructure implements ObserverTemplate {
  public events: EventsCollection<keyof RawClientEvents> = [];

  constructor(public client: SilverClient) {}

  watch<EventName extends keyof ClientEvents>(event: EventName, callback: EventCallback<EventName>): Awaitable<void> {
    const normalizedName = (event.charAt(2).toLowerCase() + event.slice(3)) as keyof RawClientEvents;

    if (normalizedName.length > 0 && typeof callback === 'function')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.events.push([normalizedName, callback as any]);
  }
}
