use crate::fixtures::block::create_block_repo;
use remind_core::{BlockRepository, NoteRepository, NoteService, PgPool};

pub fn create_note_repo(pool: PgPool) -> NoteRepository {
    NoteRepository::new(pool)
}

pub fn create_note_service(pool: PgPool) -> NoteService<NoteRepository, BlockRepository> {
    let repo = create_note_repo(pool.clone());
    let block_repo = create_block_repo(pool);
    NoteService::new(repo, block_repo)
}
