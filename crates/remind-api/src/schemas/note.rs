use crate::schemas::block::BlockSchema;
use remind_core::{NoteCreateDTO, NoteDTO};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NoteSchema {
    pub id: Uuid,
    pub title: String,
    pub workspace_id: Uuid,
    pub blocks: Vec<BlockSchema>,
}

impl From<NoteDTO> for NoteSchema {
    fn from(value: NoteDTO) -> Self {
        Self {
            id: value.id,
            title: value.title,
            workspace_id: value.workspace_id,
            blocks: value
                .blocks
                .iter()
                .map(|b| BlockSchema::from(b.clone()))
                .collect(),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CreateNoteSchema {
    pub title: String,
    pub workspace_id: Uuid,
}

impl From<CreateNoteSchema> for NoteCreateDTO {
    fn from(value: CreateNoteSchema) -> Self {
        Self {
            title: value.title,
            workspace_id: value.workspace_id,
        }
    }
}
