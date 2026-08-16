/// <reference types="vite/client" />

// Injected at build time by vite.config.ts from package.json "version".
declare const __APP_VERSION__: string;

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.webp" {
  const value: string;
  export default value;
}

declare module "*.pdf" {
  const value: string;
  export default value;
}
