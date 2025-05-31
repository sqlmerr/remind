use crate::dto::block::BlockDTO;
use crate::entities::note::NoteIconType;
use uuid::Uuid;

#[derive(Clone, Debug)]
pub struct NoteDTO {
    pub id: Uuid,
    pub title: String,
    pub icon_type: NoteIconType,
    pub icon_data: String,
    pub workspace_id: Uuid,
    pub blocks: Vec<BlockDTO>,
    pub parent_note: Option<Uuid>,
}

#[derive(Clone, Debug)]
pub struct NoteCreateDTO {
    pub title: String,
    pub workspace_id: Uuid,
    pub parent_note: Option<Uuid>,
}
