use async_trait::async_trait;
use sqlx::types::Json;
use uuid::Uuid;
use crate::Block;
use crate::errors::CoreError;

#[async_trait]
pub trait BlockRepo {
    async fn create(&self, data: Block) -> crate::errors::Result<()>;
    async fn find_one(&self, id: Uuid) -> crate::errors::Result<Option<Block>>;
    async fn find_all_in_note(&self, note_id: Uuid) -> crate::errors::Result<Vec<Block>>;
    async fn delete(&self, id: Uuid) -> crate::errors::Result<()>;
    async fn save(&self, data: Block) -> crate::errors::Result<()>;
}

#[derive(Clone)]
pub struct BlockRepository {
    pool: sqlx::PgPool,
}

impl BlockRepository {
    pub fn new(pool: sqlx::PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl BlockRepo for BlockRepository {
    async fn create(&self, data: Block) -> crate::errors::Result<()> {
        sqlx::query(
            r#"INSERT INTO blocks (id, block_type, content, note_id, position)
        VALUES ($1, $2, $3, $4, $5)"#,
        )
            .bind(data.id)
            .bind(data.block_type)
            .bind(Json(&data.content))
            .bind(data.note_id)
            .bind(data.position)
            .execute(&self.pool)
            .await?;

        Ok(())
    }

    async fn find_one(&self, id: Uuid) -> crate::errors::Result<Option<Block>> {
        let block = sqlx::query_as::<_, Block>(r#"SELECT * FROM blocks WHERE id = $1"#)
            .bind(id)
            .fetch_optional(&self.pool).await?;
        Ok(block)
    }

    async fn find_all_in_note(&self, note_id: Uuid) -> crate::errors::Result<Vec<Block>> {
        let blocks = sqlx::query_as::<_, Block>(r#"SELECT * FROM blocks WHERE note_id = $1 ORDER BY position"#)
            .bind(note_id)
            .fetch_all(&self.pool).await?;
        Ok(blocks)
    }

    async fn delete(&self, id: Uuid) -> crate::errors::Result<()> {
        sqlx::query(r#"DELETE FROM blocks WHERE id = $1"#)
            .bind(id)
            .execute(&self.pool).await?;
        Ok(())
    }

    async fn save(&self, data: Block) -> crate::errors::Result<()> {
        sqlx::query(
            r#"UPDATE blocks SET block_type = $2, content = $3, note_id = $4, position = $5 WHERE id = $1"#,
        )
            .bind(data.id)
            .bind(data.block_type)
            .bind(Json(&data.content))
            .bind(data.note_id)
            .bind(data.position)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}