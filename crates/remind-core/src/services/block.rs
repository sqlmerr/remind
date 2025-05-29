use crate::errors::{CoreError, Result};
use crate::{Block, BlockCreateDTO, BlockDTO, BlockRepo};
use uuid::Uuid;

#[derive(Clone)]
pub struct BlockService<R: BlockRepo> {
    repo: R,
}

impl<R: BlockRepo> BlockService<R> {
    pub fn new(repo: R) -> Self {
        Self { repo }
    }

    pub async fn create(&self, data: BlockCreateDTO) -> Result<BlockDTO> {
        let current_blocks = self.get_all_in_note(data.note_id).await?;
        let position;
        if current_blocks.len() == 0 {
            position = 0
        } else {
            position = current_blocks.last().unwrap().position + 1
        }

        let id = Uuid::new_v4();
        let block = Block {
            id,
            block_type: data.block_type,
            content: data.content,
            note_id: data.note_id,
            position,
        };
        self.repo.create(block).await?;

        let dto = self.find_one(id).await?;
        Ok(dto)
    }

    pub async fn find_one(&self, id: Uuid) -> Result<BlockDTO> {
        match self.repo.find_one(id).await? {
            None => Err(CoreError::NotFound),
            Some(block) => Ok(block.into()),
        }
    }

    pub async fn get_all_in_note(&self, note_id: Uuid) -> Result<Vec<BlockDTO>> {
        let blocks = self
            .repo
            .find_all_in_note(note_id)
            .await?
            .iter()
            .map(|b| BlockDTO::from(b.clone()))
            .collect();
        Ok(blocks)
    }
}
