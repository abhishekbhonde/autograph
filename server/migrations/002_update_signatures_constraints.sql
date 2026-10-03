-- Drop outdated style and name length check constraints
ALTER TABLE signatures DROP CONSTRAINT IF EXISTS signatures_style_valid;
ALTER TABLE signatures DROP CONSTRAINT IF EXISTS signatures_name_len;

-- Add updated name length constraint up to 80 chars
ALTER TABLE signatures ADD CONSTRAINT signatures_name_len CHECK (char_length(name) BETWEEN 1 AND 80);
