use remind_core::{BlockRepository, BlockService, PgPool};

pub fn create_block_repo(pool: PgPool) -> BlockRepository {
    BlockRepository::new(pool)
}

pub fn create_block_service(pool: PgPool) -> BlockService<BlockRepository> {
    let repo = create_block_repo(pool);
    BlockService::new(repo)
}
