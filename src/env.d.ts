/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@astrojs/cloudflare" />

type User = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  googleId: string | null;
  authProvider: string;
  role: string;
  createdAt: Date;
};

declare global {
  namespace App {
    interface Locals {
      user?: User;
    }
  }

  interface Env {
    DATABASE_URL: string;
    GOOGLE_CLIENT_ID?: string;
    CLOUDFLARE_R2_ACCESS_KEY_ID?: string;
    CLOUDFLARE_R2_SECRET_ACCESS_KEY?: string;
    CLOUDFLARE_R2_BUCKET?: string;
    CLOUDFLARE_R2_ACCOUNT_ID?: string;
    CLOUDFLARE_R2_PUBLIC_URL?: string;
    PUBLIC_GA_MEASUREMENT_ID?: string;
    GA_API_SECRET?: string;
    PUBLIC_META_PIXEL_ID?: string;
    META_ACCESS_TOKEN?: string;
    META_TEST_EVENT_CODE?: string;
  }

  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    __THREE__?: any;
    __heroThreeCleanup?: (() => void) | null;
    __heroThreePageLoadBound?: boolean;
  }
}

export {};
