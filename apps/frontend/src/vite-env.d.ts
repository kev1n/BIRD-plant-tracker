/// <reference types="vite/client" />
declare module 'randomcolor' {
  export default function randomColor(
    options?: {
      luminosity?: 'bright' | 'dark' | 'light';
      hue?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'monochrome' | 'random';
      seed?: string;
      format?: string; // e.g., 'hex', 'rgb', etc.
      alpha?: number; // 0 to 1 for transparency
    }
  ): string;
}

declare module 'chroma-js' {
  export function average(
    colors: string[],
    mode?: 'rgb' | 'lab' | 'hsl' | 'hsv',
    weights?: number[]
  ): string;
}