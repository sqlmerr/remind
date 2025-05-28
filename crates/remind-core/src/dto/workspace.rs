use uuid::Uuid;
use crate::Workspace;

#[derive(Debug, Clone)]
pub struct WorkspaceDTO {
    pub id: Uuid,
    pub title: String,
    pub user_id: Uuid,
}

#[derive(Debug, Clone)]
pub struct WorkspaceCreateDTO {
    pub title: String,
    pub user_id: Uuid,
}

impl From<Workspace> for WorkspaceDTO {
    fn from(value: Workspace) -> Self {
        Self {
            id: value.id,
            user_id: value.user_id,
            title: value.title
        }
    }
}
