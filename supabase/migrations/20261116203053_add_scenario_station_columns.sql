/*
# Add columns for new quest stations

Adds columns to quest_results for the two new scenario stations:
- phone_call_score (integer) - "Станция 2: Звонок из поликлиники" points
- phone_call_correct (boolean) - whether the main scenario answer was correct
- romance_scam_score (integer) - "Станция 3: Ловушка доверия" points
- romance_scam_correct (boolean) - whether the main scenario answer was correct

All default to 0/false so existing rows remain valid.
*/

ALTER TABLE quest_results
  ADD COLUMN IF NOT EXISTS phone_call_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS phone_call_correct boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS romance_scam_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS romance_scam_correct boolean NOT NULL DEFAULT false;
