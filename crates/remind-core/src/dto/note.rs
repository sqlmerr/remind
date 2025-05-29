use crate::dto::block::BlockDTO;
use uuid::Uuid;

#[derive(Clone, Debug)]
pub struct NoteDTO {
    pub id: Uuid,
    pub title: String,
    pub workspace_id: Uuid,
    pub blocks: Vec<BlockDTO>,
}

#[derive(Clone, Debug)]
pub struct NoteCreateDTO {
    pub title: String,
    pub workspace_id: Uuid,
}
