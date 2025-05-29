pub use remind_auth::AuthError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CoreError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error(transparent)]
    AuthError(#[from] AuthError),
    #[error("Server error")]
    ServerError,
    #[error("Not found")]
    NotFound,
    #[error("User have reached the limit of create workspaces (3)")]
    TooManyWorkspaces,
    #[error("You don't have access to do it")]
    AccessDenied,
}

pub type Result<T> = std::result::Result<T, CoreError>;
