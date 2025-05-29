use axum::extract::State;
use axum::{Json, Router};
use axum::routing::{get, post};
use crate::schemas::note::{CreateNoteSchema, NoteSchema};
use crate::state::AppState;
use crate::errors::Result;

pub(crate) fn router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/", post(create_note))
        .layer(axum::middleware::from_fn_with_state(state, super::auth_middleware))
}

async fn create_note(
    State(state): State<AppState>,
    Json(data): Json<CreateNoteSchema>
) -> Result<Json<NoteSchema>> {
    let note = state.note_service.create(data.into()).await?;
    Ok(Json(note.into()))
}