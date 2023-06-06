export default class OptionHandlerUtil {
  static create<Options>(structureName: string, structureOptions: Options) {
    return {
      optional<K extends keyof Options, D>(name: K, defaultValue: D) {
        const value = structureOptions[name];

        return value === undefined ? defaultValue : value;
      },

      required<K extends keyof Options>(name: K) {
        const value = structureOptions[name];

        if (value === undefined) {
          throw new Error(`The option "${String(name)}" of structure "${structureName}" is required.`);
        }
        return value;
      }
    };
  }
}
