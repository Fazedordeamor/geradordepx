declare module "qrcode" {
  const QRCode: {
    toDataURL(text: string, options?: any): Promise<string>;
    toString?(text: string, options?: any): Promise<string>;
  };

  export default QRCode;
}