use crate::fixtures::{
    create_note_service, create_user_fixture, create_user_repository, create_workspace_fixture,
    create_workspace_repo,
};
use remind_core::NoteCreateDTO;
use sqlx::PgPool;
use uuid::Uuid;

mod fixtures;

#[sqlx::test(migrations = "../../migrations")]
async fn test_create_note(pool: PgPool) {
    let user_repo = create_user_repository(pool.clone());
    let user = create_user_fixture(user_repo).await;
    let service = create_note_service(pool.clone());
    let workspace = create_workspace_fixture(create_workspace_repo(pool), user.id).await;

    let dto = NoteCreateDTO {
        title: "Note".to_string(),
        workspace_id: workspace.id,
        parent_note: None,
    };
    let note = service.create(dto.clone()).await.unwrap();
    assert_eq!(note.title, dto.title);
    assert_eq!(note.workspace_id, dto.workspace_id);
    assert_eq!(note.blocks.len(), 0);
}

#[sqlx::test(migrations = "../../migrations")]
async fn test_find_one_note(pool: PgPool) {
    let user_repo = create_user_repository(pool.clone());
    let user = create_user_fixture(user_repo).await;
    let service = create_note_service(pool.clone());
    let workspace = create_workspace_fixture(create_workspace_repo(pool), user.id).await;

    let dto = NoteCreateDTO {
        title: "Note".to_string(),
        workspace_id: workspace.id,
        parent_note: None,
    };
    let note = service.create(dto.clone()).await.unwrap();
    let note_found = service.find_one(note.id).await.unwrap();
    assert_eq!(note.id, note_found.id);

    let not_found = service.find_one(Uuid::new_v4()).await;
    assert!(not_found.is_err());
}

#[sqlx::test(migrations = "../../migrations")]
async fn test_get_all_notes_in_workspace(pool: PgPool) {
    let user_repo = create_user_repository(pool.clone());
    let user = create_user_fixture(user_repo).await;
    let service = create_note_service(pool.clone());
    let workspace = create_workspace_fixture(create_workspace_repo(pool), user.id).await;

    let note1 = service
        .create(NoteCreateDTO {
            title: "Note1".to_string(),
            workspace_id: workspace.id,
            parent_note: None,
        })
        .await
        .unwrap();
    let note2 = service
        .create(NoteCreateDTO {
            title: "Note2".to_string(),
            workspace_id: workspace.id,
            parent_note: None,
        })
        .await
        .unwrap();
    let note3 = service
        .create(NoteCreateDTO {
            title: "Note3".to_string(),
            workspace_id: workspace.id,
            parent_note: None,
        })
        .await
        .unwrap();

    let notes = service.get_all_in_workspace(workspace.id).await.unwrap();
    assert_eq!(notes.len(), 3);
    assert_eq!(notes[0].id, note1.id);
    assert_eq!(notes[1].id, note2.id);
    assert_eq!(notes[2].id, note3.id);
}

#[sqlx::test(migrations = "../../migrations")]
async fn test_delete_note(pool: PgPool) {
    let user_repo = create_user_repository(pool.clone());
    let user = create_user_fixture(user_repo).await;
    let service = create_note_service(pool.clone());
    let workspace = create_workspace_fixture(create_workspace_repo(pool), user.id).await;

    let dto = NoteCreateDTO {
        title: "Note".to_string(),
        workspace_id: workspace.id,
        parent_note: None,
    };
    let note = service.create(dto.clone()).await.unwrap();

    let res = service.delete(note.id).await;
    assert!(res.is_ok());
}
