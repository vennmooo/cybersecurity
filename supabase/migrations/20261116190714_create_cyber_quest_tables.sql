/*
# Cyber Quest - participants and results tables

1. New Tables
- `participants` - stores registration data for each quest participant
  - id (uuid, primary key)
  - full_name (text, participant ФИО)
  - institution (text, educational institution)
  - group_class (text, group or class)
  - team (text, optional team name)
  - quest_date (date, date of participation)
  - created_at (timestamp)
- `quest_results` - stores the final results of a participant's quest
  - id (uuid, primary key)
  - participant_id (uuid, foreign key to participants)
  - total_score (integer, points earned)
  - max_score (integer, maximum possible points)
  - percentage (integer, percent correct)
  - status (text, completion status)
  - phishing_correct (integer, number of correct phishing identifications)
  - password_bonus (boolean, whether password bonus was earned)
  - created_at (timestamp)
2. Security
- Enable RLS on both tables.
- Grant CRUD to anon + authenticated (no-auth public quest app).
- Allow anon + authenticated full CRUD because data is intentionally public/shared for the educational quest.
*/

CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  institution text NOT NULL,
  group_class text NOT NULL,
  team text,
  quest_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON participants TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_participants" ON participants;
CREATE POLICY "anon_select_participants" ON participants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_participants" ON participants;
CREATE POLICY "anon_insert_participants" ON participants FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_participants" ON participants;
CREATE POLICY "anon_update_participants" ON participants FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_participants" ON participants;
CREATE POLICY "anon_delete_participants" ON participants FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS quest_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  total_score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 100,
  percentage integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'В процессе',
  phishing_correct integer NOT NULL DEFAULT 0,
  password_bonus boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quest_results ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON quest_results TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_results" ON quest_results;
CREATE POLICY "anon_select_results" ON quest_results FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_results" ON quest_results;
CREATE POLICY "anon_insert_results" ON quest_results FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_results" ON quest_results;
CREATE POLICY "anon_update_results" ON quest_results FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_results" ON quest_results;
CREATE POLICY "anon_delete_results" ON quest_results FOR DELETE
  TO anon, authenticated USING (true);
