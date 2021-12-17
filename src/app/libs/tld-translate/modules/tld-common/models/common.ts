
/**
 * Class for storing some common methods or global app constants.
 */
export class Common {
  static getCookie(name: string) {
    const ca: Array<string> = document.cookie.split(';');
    const caLen: number = ca.length;
    const cookieName = `${name}=`;
    let c: string;

    for (let i = 0; i < caLen; i += 1) {
      c = ca[i].replace(/^\s+/g, '');
      if (c.indexOf(cookieName) === 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return undefined;
  }

  static getFileExtension(fileName: string) {
    return fileName.slice(fileName.lastIndexOf(".") + 1);
  }

  /**
   * Removes special characters so string is not interpretated as html.
   * @param text 
   */
  static escapeHtmlString(text: string): string {
    // without creating regexp, it is not building library.
    // https://stackoverflow.com/questions/57292603/angular7-aot-expression-form-not-supported
    return text.replace(new RegExp("&", "g"), "&amp;")
      .replace(new RegExp("<", "g"), "&lt;")
      .replace(new RegExp(">", "g"), "&gt;")
      .replace(new RegExp("\"", "g"), "&quot;")
      .replace(new RegExp("'", "g"), "&#039;");
  }
  /**
   * Splits string into paragraphs.
   * @param text 
   */
  static splitInParagraphs(text: string): string[] {
    return text.split("\n");
  }

  static joinParagraphs(text: string[]): string {
    return text.join("\n");
  }

  static toCamelCase(text: string, symbol = "-"): string {
    let arr = text.split(symbol);
    let capital = arr.map((item, index) => index ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item.toLowerCase());
    // ^-- change here.
    return capital.join("");
  }

  static bytesToMb(bytes: number): number {
    return Math.round(bytes / 1048576);
  }

  static pascalCaseToEnum(property: string): string {
    return property.replace(new RegExp("([a-z])([A-Z])","g"), "$1_$2").toUpperCase();
  }

}
