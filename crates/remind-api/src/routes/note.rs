use crate::errors::Result;
use crate::schemas::OkResponseSchema;
use crate::schemas::note::{CreateNoteSchema, NoteSchema};
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::routing::{delete, post};
use axum::{Json, Router};
use uuid::Uuid;

pub(crate) fn router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/", post(create_note))
        .route("/{id}", delete(delete_note))
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
