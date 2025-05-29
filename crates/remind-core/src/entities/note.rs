use sqlx::FromRow;
use uuid::Uuid;

#[derive(Default, Clone, Debug, FromRow)]
pub struct Note {
    pub id: Uuid,
    pub title: String,
    pub workspace_id: Uuid,
}