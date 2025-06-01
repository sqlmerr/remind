use crate::schemas::block::BlockSchema;
use remind_core::{NoteCreateDTO, NoteDTO, NoteIconType, NoteUpdateDTO};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NoteIconSchema {
    #[serde(rename = "type")]
    pub icon_type: NoteIconType,
    pub data: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NoteSchema {
    pub id: Uuid,
    pub title: String,
    pub icon: NoteIconSchema,
    pub workspace_id: Uuid,
    pub blocks: Vec<BlockSchema>,
    pub parent: Option<Uuid>,
}

impl From<NoteDTO> for NoteSchema {
    fn from(value: NoteDTO) -> Self {
        Self {
            id: value.id,
            title: value.title,
            icon: NoteIconSchema {
                icon_type: value.icon_type,
                data: value.icon_data,
            },
            workspace_id: value.workspace_id,
            blocks: value
                .blocks
                .iter()
                .map(|b| BlockSchema::from(b.clone()))
                .collect(),
            parent: value.parent_note,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CreateNoteSchema {
    pub title: String,
    pub workspace_id: Uuid,
    pub parent: Option<Uuid>,
}

impl From<CreateNoteSchema> for NoteCreateDTO {
    fn from(value: CreateNoteSchema) -> Self {
        Self {
            title: value.title,
            workspace_id: value.workspace_id,
            parent_note: value.parent,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UpdateNoteSchema {
    pub title: Option<String>,
}

impl From<UpdateNoteSchema> for NoteUpdateDTO {
    fn from(value: UpdateNoteSchema) -> Self {
        Self { title: value.title }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ReorderNoteBlocksSchema {
    pub blocks: Vec<Uuid>,
}
