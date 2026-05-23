-- Test results table for saving diagnosis quiz results
CREATE TABLE IF NOT EXISTS test_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_type TEXT NOT NULL,
  test_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  yes_count INTEGER NOT NULL DEFAULT 0,
  maybe_count INTEGER NOT NULL DEFAULT 0,
  no_count INTEGER NOT NULL DEFAULT 0,
  result_level TEXT NOT NULL,
  result_text TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS test_results_user_idx ON test_results(user_id);
CREATE INDEX IF NOT EXISTS test_results_created_at_idx ON test_results(created_at);