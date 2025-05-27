use remind_core::{PgPool, UserRepository, UserService};
use remind_core::remind_auth::{DecodingKey, EncodingKey, JwtProcessor};
use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub user_service: UserService<UserRepository>,
    pub config: Config,
    pub jwt_processor: JwtProcessor,
}

impl AppState {
    pub fn new(pg_pool: PgPool, config: Config) -> Self {
        let user_repo = UserRepository::new(pg_pool);
        let jwt_processor = JwtProcessor::new(
            EncodingKey::from_secret(config.jwt_secret.as_ref()), 
            DecodingKey::from_secret(config.jwt_secret.as_ref())
        );
        let user_service = UserService::new(user_repo, jwt_processor.clone());
        Self {
            user_service,
            config,
            jwt_processor,
        }
    }
}