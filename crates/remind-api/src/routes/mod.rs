use axum::body::Body;
use axum::extract::{Request, State};
use axum::http::Response;
use axum::Json;
use axum::middleware::Next;
use axum::response::IntoResponse;
use serde_json::json;
use remind_core::errors::{AuthError, CoreError};
use remind_core::UserDTO;
use crate::errors::ApiError;
use crate::state::AppState;

pub(crate) mod auth;
pub(crate) mod workspace;
pub(crate) mod block;
pub(crate) mod note;

pub async fn handler_404() -> impl IntoResponse {
    (axum::http::StatusCode::NOT_FOUND, Json(json!({"message": "Not found", "status_code": 404})))
}

pub async fn auth_middleware(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response<Body>, ApiError> {
    let auth_header = match request.headers_mut().get(axum::http::header::AUTHORIZATION) {
        None => return Err(CoreError::from(AuthError::InvalidToken))?,
        Some(header) => header.to_str().map_err(|_| CoreError::from(AuthError::InvalidToken))?,
    };

    let mut header = auth_header.split_whitespace();
    let (_token_type, token) = (header.next(), header.next().ok_or(CoreError::from(AuthError::InvalidToken))?);

    let claims = state.jwt_processor.decode_token(token).map_err(|_| CoreError::from(AuthError::InvalidToken))?;
    request.extensions_mut().insert(claims.clone());

    let user: UserDTO = state
        .user_service
        .find_one_by_username(claims.sub.to_string())
        .await
        .map_err(|_| CoreError::from(AuthError::InvalidToken))?;
    request.extensions_mut().insert(user);

    Ok(next.run(request).await)
}