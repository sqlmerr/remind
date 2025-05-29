use remind_core::{BlockRepository, BlockService, NoteRepository, NoteService, PgPool, UserRepository, UserService, WorkspaceRepository, WorkspaceService};
use remind_core::remind_auth::{DecodingKey, EncodingKey, JwtProcessor};
use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub user_service: UserService<UserRepository>,
    pub workspace_service: WorkspaceService<WorkspaceRepository>,
    pub block_service: BlockService<BlockRepository>,
    pub note_service: NoteService<NoteRepository, BlockRepository>,
    pub config: Config,
    pub jwt_processor: JwtProcessor,
}

impl AppState {
    pub fn new(pg_pool: PgPool, config: Config) -> Self {
        let user_repo = UserRepository::new(pg_pool.clone());
        let jwt_processor = JwtProcessor::new(
            EncodingKey::from_secret(config.jwt_secret.as_ref()), 
            DecodingKey::from_secret(config.jwt_secret.as_ref())
        );
        let user_service = UserService::new(user_repo, jwt_processor.clone());
        let workspace_repo = WorkspaceRepository::new(pg_pool.clone());
        let workspace_service = WorkspaceService::new(workspace_repo);
        
        let block_repo = BlockRepository::new(pg_pool.clone());
        let block_service = BlockService::new(block_repo.clone());
        let note_repo = NoteRepository::new(pg_pool.clone());
        let note_service = NoteService::new(note_repo, block_repo);
        Self {
            user_service,
            config,
            jwt_processor,
            workspace_service,
            block_service,
            note_service
        }
    }
}