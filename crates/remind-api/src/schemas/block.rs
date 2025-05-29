use serde::{Deserialize, Serialize};
use uuid::Uuid;
use remind_core::{BlockContent, BlockCreateDTO, BlockDTO, BlockType};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BlockSchema {
    pub id: Uuid,
    pub block_type: BlockType,
    pub content: BlockContent,
    pub position: i32
}

impl From<BlockDTO> for BlockSchema {
    fn from(value: BlockDTO) -> Self {
        Self {
            id: value.id,
            block_type: value.block_type,
            content: value.content,
            position: value.position,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CreateBlockSchema {
    pub block_type: BlockType,
    pub content: BlockContent,
    pub note_id: Uuid
}

impl From<CreateBlockSchema> for BlockCreateDTO {
    fn from(value: CreateBlockSchema) -> Self {
        Self {
            block_type: value.block_type,
            content: value.content,
            note_id: value.note_id
        }
    }
}
