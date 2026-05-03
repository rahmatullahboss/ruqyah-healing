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
  }
}

export {};
