/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API. Optional; defaults to "/api" (dev proxy). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
