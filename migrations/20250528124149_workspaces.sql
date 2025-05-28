-- Add migration script here
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT fk_user_workspace FOREIGN KEY(user_id) REFERENCES users(id)
)