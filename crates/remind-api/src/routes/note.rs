use crate::errors::Result;
use crate::schemas::OkResponseSchema;
use crate::schemas::note::{
    CreateNoteSchema, NoteSchema, ReorderNoteBlocksSchema, UpdateNoteSchema,
};
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::routing::{delete, get, post, put};
use axum::{Extension, Json, Router};
use remind_core::UserDTO;
use remind_core::errors::CoreError;
use uuid::Uuid;

pub(crate) fn router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/", post(create_note))
        .route("/{id}", delete(delete_note))
        .route("/{id}", get(get_note))
        .route("/{id}", put(update_note))
        .route("/{id}/blocks/reorder", post(reorder_blocks))
        .layer(axum::middleware::from_fn_with_state(
            state,
            super::auth_middleware,
        ))
}

async fn create_note(
    State(state): State<AppState>,
    Json(data): Json<CreateNoteSchema>,
) -> Result<Json<NoteSchema>> {
    state.workspace_service.get(data.workspace_id).await?;
    let note = state.note_service.create(data.into()).await?;
    Ok(Json(note.into()))
}

async fn delete_note(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<Json<OkResponseSchema>> {
    state.note_service.delete(id).await?;
    Ok(Json(OkResponseSchema::new(true)))
}

async fn get_note(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Extension(user): Extension<UserDTO>,
) -> Result<Json<NoteSchema>> {
    let note = state.note_service.find_one(id).await?;
    let workspace = state.workspace_service.get(note.workspace_id).await?;
    if workspace.user_id != user.id {
        return Err(CoreError::AccessDenied.into());
    }

    Ok(Json(note.into()))
}

async fn update_note(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Extension(user): Extension<UserDTO>,
    Json(data): Json<UpdateNoteSchema>,
) -> Result<Json<OkResponseSchema>> {
    let note = state.note_service.find_one(id).await?;
    let workspace = state.workspace_service.get(note.workspace_id).await?;
    if workspace.user_id != user.id {
        return Err(CoreError::AccessDenied.into());
    }

    state.note_service.update(id, data.into()).await?;

    Ok(Json(OkResponseSchema::new(true)))
}

async fn reorder_blocks(
    State(state): State<AppState>,
    Extension(user): Extension<UserDTO>,
    Path(id): Path<Uuid>,
    Json(data): Json<ReorderNoteBlocksSchema>,
) -> Result<Json<NoteSchema>> {
    let note = state.note_service.find_one(id).await?;
    let workspace = state.workspace_service.get(note.workspace_id).await?;
    if workspace.user_id != user.id {
        return Err(CoreError::AccessDenied.into());
    }

    state.note_service.reorder_blocks(id, data.blocks).await?;
    let note = state.note_service.find_one(id).await?;

    Ok(Json(note.into()))
}
