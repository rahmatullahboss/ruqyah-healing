-- Site Settings (key-value store for clinic config)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Notices / Events / Announcements
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📢',
  badge TEXT NOT NULL DEFAULT 'নোটিশ',
  badge_color TEXT NOT NULL DEFAULT 'event',
  event_date TEXT NOT NULL,
  urgent BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Products / Supplements
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  rating REAL NOT NULL DEFAULT 5.0,
  benefit TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  badge TEXT,
  category TEXT NOT NULL DEFAULT 'অন্যান্য',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PDF Resources
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT NOT NULL DEFAULT '',
  pages INTEGER NOT NULL DEFAULT 0,
  file_size TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'গাইড',
  language TEXT NOT NULL DEFAULT 'বাংলা',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
