use sea_query::Iden;
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Default, Clone, FromRow)]
pub struct User {
    /// User identifier
    pub id: Uuid,
    /// User unique name
    pub username: String,
    /// User email
    pub email: String,
    /// Hashed password
    pub password: String,
}

#[derive(Iden)]
pub enum UserTable {
    Table,
    Id,
    Username,
    Email,
    Password,
}
