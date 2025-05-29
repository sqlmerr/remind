use crate::User;
use crate::errors::Result;
use async_trait::async_trait;
use uuid::Uuid;

#[async_trait]
pub trait UserRepo {
    async fn create(&self, data: User) -> Result<()>;
    async fn find_one(&self, id: Uuid) -> Result<Option<User>>;
    async fn find_one_by_username(&self, username: String) -> Result<Option<User>>;
    async fn find_one_by_email(&self, email: String) -> Result<Option<User>>;
    async fn find_all(&self) -> Result<Vec<User>>;
    async fn delete(&self, id: Uuid) -> Result<()>;
    async fn save(&self, data: User) -> Result<()>;
}

#[derive(Clone)]
pub struct UserRepository {
    pool: sqlx::PgPool,
}

impl UserRepository {
    pub fn new(pool: sqlx::PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl UserRepo for UserRepository {
    async fn create(&self, data: User) -> Result<()> {
        sqlx::query!(
            r#"INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4)"#,
            data.id,
            data.username,
            data.email,
            data.password
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn find_one(&self, id: Uuid) -> Result<Option<User>> {
        let user = sqlx::query_as!(User, r#"SELECT * FROM users WHERE id = $1"#, id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(user)
    }
    async fn find_one_by_username(&self, username: String) -> Result<Option<User>> {
        let user = sqlx::query_as!(User, r#"SELECT * FROM users WHERE username = $1"#, username)
            .fetch_optional(&self.pool)
            .await?;
        Ok(user)
    }

    async fn find_one_by_email(&self, email: String) -> Result<Option<User>> {
        let user = sqlx::query_as!(User, r#"SELECT * FROM users WHERE email = $1"#, email)
            .fetch_optional(&self.pool)
            .await?;
        Ok(user)
    }

    async fn find_all(&self) -> Result<Vec<User>> {
        todo!()
    }

    async fn delete(&self, id: Uuid) -> Result<()> {
        sqlx::query!(r#"DELETE FROM users WHERE id = $1"#, id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn save(&self, data: User) -> Result<()> {
        sqlx::query!(
            r#"UPDATE users SET username = $2, email = $3, password = $4 WHERE id = $1"#,
            data.id,
            data.username,
            data.email,
            data.password
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}
