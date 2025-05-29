use crate::errors::Result;
use crate::schemas::block::{BlockSchema, CreateBlockSchema};
use crate::state::AppState;
use axum::extract::State;
use axum::routing::post;
use axum::{Extension, Json, Router};
use remind_core::UserDTO;
use remind_core::errors::CoreError;

pub(crate) fn router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/", post(add_block))
        .layer(axum::middleware::from_fn_with_state(
            state,
            super::auth_middleware,
        ))
}

async fn add_block(
    State(state): State<AppState>,
    Extension(user): Extension<UserDTO>,
    Json(data): Json<CreateBlockSchema>,
) -> Result<Json<BlockSchema>> {
    let note = state.note_service.find_one(data.note_id).await?;
    let workspace = state.workspace_service.get(note.workspace_id).await?;
    if user.id != workspace.user_id {
        return Err(CoreError::DontHaveAccess.into());
    }
    let block = state.block_service.create(data.into()).await?;
    Ok(Json(block.into()))
}
