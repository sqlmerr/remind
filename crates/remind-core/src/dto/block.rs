use crate::{Block, BlockContent, BlockType};
use uuid::Uuid;

#[derive(Clone, Debug)]
pub struct BlockDTO {
    pub id: Uuid,
    pub block_type: BlockType,
    pub content: BlockContent,
    pub position: i32,
}

impl From<Block> for BlockDTO {
    fn from(value: Block) -> Self {
        Self {
            id: value.id,
            block_type: value.block_type,
            content: value.content,
            position: value.position,
        }
    }
}

#[derive(Clone, Debug)]
pub struct BlockCreateDTO {
    pub block_type: BlockType,
    pub content: BlockContent,
    pub note_id: Uuid,
}
