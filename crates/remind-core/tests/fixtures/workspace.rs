#![allow(dead_code)]

use remind_core::{Workspace, WorkspaceRepo, WorkspaceRepository, WorkspaceService};
use sqlx::PgPool;
use uuid::Uuid;

pub fn create_workspace_repo(pool: PgPool) -> WorkspaceRepository {
    WorkspaceRepository::new(pool)
}

pub fn create_workspace_service(pool: PgPool) -> WorkspaceService<WorkspaceRepository> {
    let repo = create_workspace_repo(pool);
    WorkspaceService::new(repo)
}

pub async fn create_workspace_fixture<R: WorkspaceRepo>(repo: R, user_id: Uuid) -> Workspace {
    let workspace = Workspace {
        id: Uuid::new_v4(),
        title: "testWorkspace".to_string(),
        user_id,
    };
    repo.create(workspace.clone()).await.unwrap();

    workspace
}
