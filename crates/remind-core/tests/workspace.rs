mod fixtures;

use crate::fixtures::{create_user_fixture, create_user_repository, create_workspace_service};
use remind_core::WorkspaceCreateDTO;
use sqlx::PgPool;
use uuid::Uuid;

#[sqlx::test(migrations = "../../migrations")]
async fn test_create_workspace(pool: PgPool) {
    let user_repo = create_user_repository(pool.clone());
    let user = create_user_fixture(user_repo).await;
    let service = create_workspace_service(pool);
    let dto = WorkspaceCreateDTO {
        title: "Workspace".to_string(),
        user_id: user.id,
    };
    let workspace = service.create(dto.clone()).await.unwrap();
    assert_eq!(workspace.user_id, user.id);
    assert_eq!(workspace.title, dto.title);

    service.create(dto.clone()).await.unwrap();
    service.create(dto.clone()).await.unwrap();
    let workspace2 = service.create(dto).await;
    assert!(workspace2.is_err());
}

#[sqlx::test(migrations = "../../migrations")]
async fn test_get_workspace(pool: PgPool) {
    let user_repo = create_user_repository(pool.clone());
    let user = create_user_fixture(user_repo).await;
    let service = create_workspace_service(pool);

    let not_found = service.get(Uuid::new_v4()).await;
    assert!(not_found.is_err());

    let dto = WorkspaceCreateDTO {
        title: "Workspace".to_string(),
        user_id: user.id,
    };
    let workspace = service.create(dto.clone()).await.unwrap();

    let found = service.get(workspace.id).await.unwrap();
    assert_eq!(found.id, workspace.id);
    assert_eq!(found.title, workspace.title);
    assert_eq!(found.user_id, workspace.user_id);
}

#[sqlx::test(migrations = "../../migrations")]
async fn test_get_user_workspaces(pool: PgPool) {
    let user_repo = create_user_repository(pool.clone());
    let user = create_user_fixture(user_repo).await;
    let service = create_workspace_service(pool);

    let workspace1 = service
        .create(WorkspaceCreateDTO {
            title: "Test1".to_string(),
            user_id: user.id,
        })
        .await
        .unwrap();
    let workspace2 = service
        .create(WorkspaceCreateDTO {
            title: "Test2".to_string(),
            user_id: user.id,
        })
        .await
        .unwrap();

    let workspaces = service.get_all_by_user(user.id).await.unwrap();
    assert_eq!(workspaces.len(), 2);
    assert_eq!(workspaces[0].id, workspace1.id);
    assert_eq!(workspaces[1].id, workspace2.id);
}
