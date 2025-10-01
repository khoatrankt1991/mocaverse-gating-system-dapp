-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE,
  invite_code_id INTEGER,
  registration_type TEXT CHECK(registration_type IN ('nft', 'invite')) NOT NULL,
  registered_at INTEGER NOT NULL,
  FOREIGN KEY (invite_code_id) REFERENCES invite_codes(id)
);

-- Indexes for faster lookup
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_wallet ON registrations(wallet_address);
CREATE INDEX idx_registrations_type ON registrations(registration_type);

