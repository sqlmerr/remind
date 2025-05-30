use crate::errors::Result;
use crate::schemas::OkResponseSchema;
use crate::schemas::block::{BlockSchema, CreateBlockSchema, UpdateBlockSchema};
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::routing::{post, put};
use axum::{Extension, Json, Router};
use remind_core::errors::CoreError;
use remind_core::{BlockUpdateDTO, UserDTO};
use uuid::Uuid;

pub(crate) fn router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/", post(add_block))
        .route("/{id}", put(update_block))
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
        return Err(CoreError::AccessDenied.into());
    }
    let block = state.block_service.create(data.into()).await?;
    Ok(Json(block.into()))
}

async fn update_block(
    State(state): State<AppState>,
    Extension(user): Extension<UserDTO>,
    Path(id): Path<Uuid>,
    Json(data): Json<UpdateBlockSchema>,
) -> Result<Json<OkResponseSchema>> {
    let block = state.block_service.find_one(id).await?;
    let note = state.note_service.find_one(block.note_id).await?;
    let workspace = state.workspace_service.get(note.workspace_id).await?;
    if workspace.user_id != user.id {
        return Err(CoreError::AccessDenied.into());
    }

    let dto = BlockUpdateDTO {
        id,
        block_type: data.block_type,
        content: data.content,
    };
    state.block_service.update(dto).await?;
    Ok(Json(OkResponseSchema::new(true)))
}
