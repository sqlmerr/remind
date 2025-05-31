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
        sqlx::query(
            "INSERT INTO notes(id, title, icon_type, icon_data, workspace_id, parent_note)  VALUES ($1, $2, $3, $4, $5, $6)",
        )
            .bind(data.id).bind(data.title).bind(data.icon_type).bind(data.icon_data).bind(data.workspace_id).bind(data.parent_note)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    async fn find_one(&self, id: Uuid) -> crate::errors::Result<Option<Note>> {
        let note = sqlx::query_as::<_, Note>(r#"SELECT * FROM notes WHERE id = $1"#)
            .bind(id)
            .fetch_optional(&self.pool)
            .await?;
        Ok(note)
    }

    async fn find_all_in_workspace(&self, workspace_id: Uuid) -> crate::errors::Result<Vec<Note>> {
        let notes = sqlx::query_as::<_, Note>(r#"SELECT * FROM notes WHERE workspace_id = $1"#)
            .bind(workspace_id)
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
        sqlx::query(
            r#"UPDATE notes SET title = $2, icon_type = $3, icon_data = $4, workspace_id = $5, parent_note = $6 WHERE id = $1"#,
        )
            .bind(data.id)
            .bind(data.title)
            .bind(data.icon_type)
            .bind(data.icon_data)
            .bind(data.workspace_id)
            .bind(data.parent_note)
        .execute(&self.pool)
        .await?;
        Ok(())
    }
}
