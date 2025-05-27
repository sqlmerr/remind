use async_trait::async_trait;
use sea_query::Expr;
use uuid::Uuid;
use crate::User;

#[async_trait]
pub trait UserRepository {
    async fn create(&self, data: User) -> Result<(), sqlx::Error>;
    async fn find_one(&self, id: Uuid) -> Result<Option<User>, sqlx::Error>;
    async fn find_all(&self, filter: Expr) -> Result<Vec<User>, sqlx::Error>;
    async fn delete(&self, id: Uuid) -> Result<(), sqlx::Error>;
    async fn update(&self, id: Uuid, data: User) -> Result<(), sqlx::Error>;
}