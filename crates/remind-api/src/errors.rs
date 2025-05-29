use axum::Json;
use axum::extract::rejection::JsonRejection;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use remind_core::errors::{AuthError, CoreError};
use serde_json::json;
use validator::ValidationErrors;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error(transparent)]
    CoreError(#[from] CoreError),
    #[error(transparent)]
    ValidationError(#[from] ValidationErrors),
    #[error(transparent)]
    AxumJsonRejection(#[from] JsonRejection),
}

pub type Result<T> = core::result::Result<T, ApiError>;

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let msg = self.to_string();
        tracing::error!("New error: {}", msg);
        let (status, message) = match self {
            ApiError::CoreError(e) => match e {
                CoreError::Database(_) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Server error".to_string(),
                ),
                CoreError::AuthError(e) => match e {
                    AuthError::WrongCredentials => (StatusCode::UNAUTHORIZED, msg),
                    AuthError::MissingCredentials => (StatusCode::UNAUTHORIZED, msg),
                    AuthError::TokenCreation => (StatusCode::INTERNAL_SERVER_ERROR, msg),
                    AuthError::InvalidToken => (StatusCode::BAD_REQUEST, msg),
                    AuthError::UsernameOccupied => (StatusCode::FORBIDDEN, msg),
                    AuthError::EmailExists => (StatusCode::FORBIDDEN, msg),
                },
                CoreError::ServerError => (StatusCode::INTERNAL_SERVER_ERROR, msg),
                CoreError::NotFound => (StatusCode::NOT_FOUND, msg),
                CoreError::TooManyWorkspaces => (StatusCode::FORBIDDEN, msg),
                CoreError::AccessDenied => (StatusCode::FORBIDDEN, msg),
            },
            Self::ValidationError(_) => (
                StatusCode::BAD_REQUEST,
                format!("Validation errors: [{}]", self).replace('\n', ","),
            ),
            _ => (StatusCode::BAD_REQUEST, msg),
        };

        (
            status,
            [(axum::http::header::CONTENT_TYPE, "application/json")],
            Json(json!({ "status_code": status.as_u16(), "message": message })),
        )
            .into_response()
    }
}
