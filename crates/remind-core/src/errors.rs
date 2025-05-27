use thiserror::Error;
pub use remind_auth::AuthError;

#[derive(Debug, Error)]
pub enum CoreError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error(transparent)]
    AuthError(#[from] AuthError),
    #[error("Server error")]
    ServerError,
    #[error("Not found")]
    NotFound
}

pub type Result<T> = std::result::Result<T, CoreError>;