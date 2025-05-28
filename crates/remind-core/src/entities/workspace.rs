use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Default, Clone, FromRow)]
pub struct Workspace {
    /// Identifier
    pub id: Uuid,
    /// Workspace title
    pub title: String,
    /// Owner id
    pub user_id: Uuid,
}