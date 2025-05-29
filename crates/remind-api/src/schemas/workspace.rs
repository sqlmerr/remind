use remind_core::WorkspaceDTO;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct WorkspaceSchema {
    pub id: Uuid,
    pub title: String,
    pub user_id: Uuid,
}

impl From<WorkspaceDTO> for WorkspaceSchema {
    fn from(value: WorkspaceDTO) -> Self {
        WorkspaceSchema {
            id: value.id,
            title: value.title,
            user_id: value.user_id,
        }
    }
}

impl From<WorkspaceSchema> for WorkspaceDTO {
    fn from(value: WorkspaceSchema) -> Self {
        Self {
            id: value.id,
            title: value.title,
            user_id: value.user_id,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CreateWorkspaceSchema {
    pub title: String,
}
