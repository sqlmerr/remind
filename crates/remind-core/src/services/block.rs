use crate::errors::{CoreError, Result};
use crate::{Block, BlockCreateDTO, BlockDTO, BlockRepo, BlockUpdateDTO};
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

        if !data.block_type.is_matching_content_type(&data.content) {
            return Err(CoreError::BlockTypeNotMatches);
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

    pub async fn delete(&self, id: Uuid) -> Result<()> {
        self.repo.delete(id).await?;
        Ok(())
    }

    pub async fn save(&self, block: BlockDTO) -> Result<()> {
        let b = self.repo.find_one(block.id).await?;
        if b.is_none() {
            return Err(CoreError::NotFound);
        }

        self.repo
            .save(Block {
                id: block.id,
                block_type: block.block_type,
                content: block.content,
                position: block.position,
                note_id: b.unwrap().note_id,
            })
            .await
    }

    pub async fn update(&self, data: BlockUpdateDTO) -> Result<()> {
        let mut block = match self.repo.find_one(data.id).await? {
            None => return Err(CoreError::NotFound),
            Some(b) => b,
        };

        if let Some(block_type) = data.block_type {
            block.block_type = block_type
        }

        if let Some(content) = data.content {
            block.content = content
        }

        if !block.block_type.is_matching_content_type(&block.content) {
            return Err(CoreError::BlockTypeNotMatches);
        }

        self.repo.save(block).await?;

        Ok(())
    }
}
