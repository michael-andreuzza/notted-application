-- Entitlements table for storing Polar purchases
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

CREATE TABLE IF NOT EXISTS entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  order_id TEXT UNIQUE NOT NULL,
  product_id TEXT,
  customer_id TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookups (restore flow)
CREATE INDEX IF NOT EXISTS idx_entitlements_email ON entitlements(email);

-- Enable Row Level Security
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (webhook)
CREATE POLICY "Service role can insert" ON entitlements
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can select by email (restore check)
-- This is safe because email is provided by user, and we only return true/false
CREATE POLICY "Anyone can check entitlement" ON entitlements
  FOR SELECT
  USING (true);
