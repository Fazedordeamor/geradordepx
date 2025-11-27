declare module "qrcode" {
  /**
   * Generate a Data URL (PNG) for the given text (e.g., PIX payload).
   * Options are kept permissive since the full library types are not required here.
   */
  export function toDataURL(
    text: string,
    opts?: {
      margin?: number;
      scale?: number;
      width?: number;
      type?: string;
      color?: { dark?: string; light?: string };
      // allow other options
      [key: string]: unknown;
    }
  ): Promise<string>;

  export function toString(text: string, opts?: any): Promise<string>;

  const qrcode: {
    toDataURL: typeof toDataURL;
    toString: typeof toString;
    [key: string]: any;
  };

  export default qrcode;
}