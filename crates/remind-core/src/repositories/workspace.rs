use crate::Workspace;
use async_trait::async_trait;
use uuid::Uuid;

#[async_trait]
pub trait WorkspaceRepo {
    async fn create(&self, data: Workspace) -> crate::errors::Result<()>;
    async fn find_one(&self, id: Uuid) -> crate::errors::Result<Option<Workspace>>;
    async fn find_all_by_user_id(&self, user_id: Uuid) -> crate::errors::Result<Vec<Workspace>>;
    async fn delete(&self, id: Uuid) -> crate::errors::Result<()>;
    async fn save(&self, data: Workspace) -> crate::errors::Result<()>;
}

#[derive(Clone)]
pub struct WorkspaceRepository {
    pool: sqlx::PgPool,
}

impl WorkspaceRepository {
    pub fn new(pool: sqlx::PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl WorkspaceRepo for WorkspaceRepository {
    async fn create(&self, data: Workspace) -> crate::errors::Result<()> {
        sqlx::query!(
            r#"INSERT INTO workspaces (id, title, user_id) VALUES ($1, $2, $3)"#,
            data.id,
            data.title,
            data.user_id
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn find_one(&self, id: Uuid) -> crate::errors::Result<Option<Workspace>> {
        let workspace = sqlx::query_as!(Workspace, r#"SELECT * FROM workspaces WHERE id = $1"#, id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(workspace)
    }

    async fn find_all_by_user_id(&self, user_id: Uuid) -> crate::errors::Result<Vec<Workspace>> {
        let workspaces = sqlx::query_as!(
            Workspace,
            r#"SELECT * FROM workspaces WHERE user_id = $1"#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(workspaces)
    }

    async fn delete(&self, id: Uuid) -> crate::errors::Result<()> {
        sqlx::query!(r#"DELETE FROM workspaces WHERE id = $1"#, id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn save(&self, data: Workspace) -> crate::errors::Result<()> {
        sqlx::query!(
            r#"UPDATE workspaces SET title = $2, user_id = $3 WHERE id = $1"#,
            data.id,
            data.title,
            data.user_id
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}
