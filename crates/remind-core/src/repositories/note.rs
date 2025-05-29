use crate::Note;
use async_trait::async_trait;
use uuid::Uuid;

#[async_trait]
pub trait NoteRepo {
    async fn create(&self, data: Note) -> crate::errors::Result<()>;
    async fn find_one(&self, id: Uuid) -> crate::errors::Result<Option<Note>>;
    async fn find_all_in_workspace(&self, workspace_id: Uuid) -> crate::errors::Result<Vec<Note>>;
    async fn delete(&self, id: Uuid) -> crate::errors::Result<()>;
    async fn save(&self, data: Note) -> crate::errors::Result<()>;
}

#[derive(Clone)]
pub struct NoteRepository {
    pool: sqlx::PgPool,
}

impl NoteRepository {
    pub fn new(pool: sqlx::PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl NoteRepo for NoteRepository {
    async fn create(&self, data: Note) -> crate::errors::Result<()> {
        sqlx::query!(
            "INSERT INTO notes(id, title, workspace_id)  VALUES ($1, $2, $3)",
            data.id,
            data.title,
            data.workspace_id
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn find_one(&self, id: Uuid) -> crate::errors::Result<Option<Note>> {
        let note = sqlx::query_as!(Note, r#"SELECT * FROM notes WHERE id = $1"#, id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(note)
    }

    async fn find_all_in_workspace(&self, workspace_id: Uuid) -> crate::errors::Result<Vec<Note>> {
        let notes = sqlx::query_as!(
            Note,
            r#"SELECT * FROM notes WHERE workspace_id = $1"#,
            workspace_id
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(notes)
    }

    async fn delete(&self, id: Uuid) -> crate::errors::Result<()> {
        sqlx::query!(r#"DELETE FROM notes WHERE id = $1"#, id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn save(&self, data: Note) -> crate::errors::Result<()> {
        sqlx::query!(
            r#"UPDATE notes SET title = $2, workspace_id = $3 WHERE id = $1"#,
            data.id,
            data.title,
            data.workspace_id
        )
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}
