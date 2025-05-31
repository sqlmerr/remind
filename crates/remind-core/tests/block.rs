use crate::fixtures::{
    create_block_service, create_note_service, create_user_fixture, create_user_repository,
    create_workspace_fixture, create_workspace_repo,
};
use remind_core::{
    BlockContent, BlockCreateDTO, BlockType, ImageContent, NoteCreateDTO, NoteDTO, PlainTextContent,
};
use sqlx::PgPool;

mod fixtures;

async fn create_note(pool: PgPool) -> NoteDTO {
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
    note
}

#[sqlx::test(migrations = "../../migrations")]
async fn test_create_block(pool: PgPool) {
    let note = create_note(pool.clone()).await;
    let block_service = create_block_service(pool);

    let dto = BlockCreateDTO {
        block_type: BlockType::PlainText,
        content: BlockContent::PlainText(PlainTextContent {
            text: "Test".to_string(),
        }),
        note_id: note.id,
    };
    let block = block_service.create(dto.clone()).await.unwrap();
    assert_eq!(block.block_type, dto.block_type);
    assert_eq!(block.note_id, dto.note_id);

    let dto2 = BlockCreateDTO {
        block_type: BlockType::Code,
        content: BlockContent::Image(ImageContent {
            url: "https://github.com/sqlmerr/remind".to_string(),
            alt: None,
        }),
        note_id: note.id,
    };
    let fail = block_service.create(dto2.clone()).await;
    assert!(fail.is_err()) // Type not matches content type
}
