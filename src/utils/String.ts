const StringUtil = class {
  decodeEntities(encodedString = ''): string {
    const translate: Record<string, string> = {
      nbsp: ' ',
      amp: '&',
      quot: '"',
      lt: '<',
      gt: '>'
    };

    return String(encodedString)
      .replace(/&(nbsp|amp|quot|lt|gt);/g, (_, entity: string) => translate[entity])
      .replace(/&#(\d+);/gi, (_, numStr: string) => String.fromCharCode(parseInt(numStr, 10)));
  }

  stripTags(htmlString = ''): string {
    return htmlString.replace(/<\/?[^>]+(>|$)/g, '').trim();
  }

  capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
};

export default new StringUtil();
