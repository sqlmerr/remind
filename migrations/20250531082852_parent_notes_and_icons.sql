-- Add migration script here
CREATE TYPE note_icon_type AS ENUM ('Emoji', 'External');

ALTER TABLE notes
    ADD COLUMN parent_note UUID NULL,
    ADD COLUMN icon_type note_icon_type NOT NULL DEFAULT 'Emoji',
    ADD COLUMN icon_data TEXT NOT NULL DEFAULT '📦'
