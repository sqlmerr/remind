use crate::{Block, BlockContent, BlockType};
use uuid::Uuid;

#[derive(Clone, Debug)]
pub struct BlockDTO {
    pub id: Uuid,
    pub block_type: BlockType,
    pub content: BlockContent,
    pub position: i32,
    pub note_id: Uuid,
}

impl From<Block> for BlockDTO {
    fn from(value: Block) -> Self {
        Self {
            id: value.id,
            block_type: value.block_type,
            content: value.content,
            position: value.position,
            note_id: value.note_id,
        }
    }
}

#[derive(Clone, Debug)]
pub struct BlockCreateDTO {
    pub block_type: BlockType,
    pub content: BlockContent,
    pub note_id: Uuid,
}

#[derive(Clone, Debug)]
pub struct BlockUpdateDTO {
    pub id: Uuid,
    pub block_type: Option<BlockType>,
    pub content: Option<BlockContent>,
}
