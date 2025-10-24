declare module 'qrcode' {
  export function toDataURL(
    text: string,
    options?: {
      width?: number;
      height?: number;
      color?: {
        dark?: string;
        light?: string;
      };
      margin?: number;
    }
  ): Promise<string>;

  export function toCanvas(
    text: string,
    canvas: HTMLCanvasElement,
    options?: {
      width?: number;
      height?: number;
      color?: {
        dark?: string;
        light?: string;
      };
      margin?: number;
    }
  ): Promise<void>;

  export function toString(
    text: string,
    options?: {
      type?: 'svg' | 'utf8';
      width?: number;
      height?: number;
      color?: {
        dark?: string;
        light?: string;
      };
      margin?: number;
    }
  ): Promise<string>;
}
