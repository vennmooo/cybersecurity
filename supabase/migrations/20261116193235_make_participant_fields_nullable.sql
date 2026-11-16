/*
# Make full_name, group_class, team nullable

The registration form now only collects date and institution. Previously
required columns full_name, group_class, and team are made nullable so
older rows are unaffected and new inserts without those fields succeed.
Existing data is preserved.
*/

ALTER TABLE participants ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE participants ALTER COLUMN group_class DROP NOT NULL;
ALTER TABLE participants ALTER COLUMN team DROP NOT NULL;
