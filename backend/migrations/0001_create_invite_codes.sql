-- Create invite_codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  referrer_email TEXT,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1
);

-- Index for faster code lookup
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_active ON invite_codes(is_active);

