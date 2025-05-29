-- Add migration script here
CREATE TYPE block_type AS ENUM ('PlainText', 'Image', 'Code', 'Checkbox');

CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    workspace_id UUID NOT NULL,
    CONSTRAINT fk_note_workspace FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY,
    block_type block_type NOT NULL,
    content JSONB NOT NULL,
    note_id UUID NOT NULL,
    position INT NOT NULL,
    CONSTRAINT fk_block_note FOREIGN KEY(note_id) REFERENCES notes(id)
);

CREATE INDEX blocks_content_idx ON blocks USING GIN (content);
