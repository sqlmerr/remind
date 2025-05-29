use crate::errors::{CoreError, Result};
use crate::{Workspace, WorkspaceCreateDTO, WorkspaceDTO, WorkspaceRepo};
use uuid::Uuid;

#[derive(Clone)]
pub struct WorkspaceService<W: WorkspaceRepo> {
    repo: W,
}

impl<W: WorkspaceRepo> WorkspaceService<W> {
    pub fn new(repo: W) -> Self {
        Self { repo }
    }

    pub async fn create(&self, data: WorkspaceCreateDTO) -> Result<WorkspaceDTO> {
        let workspaces = self.repo.find_all_by_user_id(data.user_id).await?;
        if workspaces.len() >= 3 {
            return Err(CoreError::TooManyWorkspaces);
        };
        let id = Uuid::new_v4();
        let workspace = Workspace {
            id,
            user_id: data.user_id,
            title: data.title,
        };
        self.repo.create(workspace.clone()).await?;

        Ok(workspace.into())
    }

    pub async fn get(&self, id: Uuid) -> Result<WorkspaceDTO> {
        let workspace = self.repo.find_one(id).await?;
        match workspace {
            None => Err(CoreError::NotFound),
            Some(w) => Ok(w.into()),
        }
    }

    pub async fn get_all_by_user(&self, user_id: Uuid) -> Result<Vec<WorkspaceDTO>> {
        let workspaces: Vec<WorkspaceDTO> = self
            .repo
            .find_all_by_user_id(user_id)
            .await?
            .iter()
            .map(|w| WorkspaceDTO::from(w.clone()))
            .collect();
        Ok(workspaces)
    }
}
