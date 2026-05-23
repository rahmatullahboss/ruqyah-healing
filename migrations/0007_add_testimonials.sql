-- Testimonials / Patient Reviews table
CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  message TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  role TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast ordering by order_index
CREATE INDEX IF NOT EXISTS testimonials_order_idx ON testimonials(order_index DESC);
CREATE INDEX IF NOT EXISTS testimonials_published_idx ON testimonials(published);