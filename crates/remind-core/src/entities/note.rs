use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Clone, Debug, sqlx::Type, PartialEq, Deserialize, Serialize)]
#[sqlx(type_name = "note_icon_type", rename_all = "PascalCase")]
pub enum NoteIconType {
    Emoji,
    External,
}

#[derive(Clone, Debug, FromRow)]
pub struct Note {
    pub id: Uuid,
    pub title: String,
    pub icon_type: NoteIconType,
    /// Emoji or URL
    pub icon_data: String,
    pub workspace_id: Uuid,
    pub parent_note: Option<Uuid>,
}
