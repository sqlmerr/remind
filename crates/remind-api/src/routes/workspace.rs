use crate::errors::Result;
use crate::schemas::DataResponseSchema;
use crate::schemas::note::NoteSchema;
use crate::schemas::workspace::{CreateWorkspaceSchema, WorkspaceSchema};
use crate::state::AppState;
use axum::extract::{Path, State};
use axum::routing::{get, post};
use axum::{Extension, Json, Router};
use remind_core::errors::CoreError;
use remind_core::{UserDTO, WorkspaceCreateDTO};
use uuid::Uuid;

pub(crate) fn router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/", post(create_workspace))
        .route("/my", get(get_my_workspaces))
        .route("/my/{id}/notes", get(get_my_workspace_notes))
        .layer(axum::middleware::from_fn_with_state(
            state,
            super::auth_middleware,
        ))
}

async fn create_workspace(
    State(state): State<AppState>,
    Extension(user): Extension<UserDTO>,
    Json(data): Json<CreateWorkspaceSchema>,
) -> Result<Json<WorkspaceSchema>> {
    let response = state
        .workspace_service
        .create(WorkspaceCreateDTO {
            title: data.title,
            user_id: user.id,
        })
        .await?;
    Ok(Json(response.into()))
}

async fn get_my_workspaces(
    State(state): State<AppState>,
    Extension(user): Extension<UserDTO>,
) -> Result<Json<DataResponseSchema<Vec<WorkspaceSchema>>>> {
    let workspaces: Vec<WorkspaceSchema> = state
        .workspace_service
        .get_all_by_user(user.id)
        .await?
        .iter()
        .map(|w| WorkspaceSchema::from(w.clone()))
        .collect();

    Ok(Json(DataResponseSchema(workspaces)))
}

async fn get_my_workspace_notes(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Extension(user): Extension<UserDTO>,
) -> Result<Json<DataResponseSchema<Vec<NoteSchema>>>> {
    let workspace = state.workspace_service.get(id).await?;
    if workspace.user_id != user.id {
        return Err(CoreError::DontHaveAccess.into());
    }

    let notes = state
        .note_service
        .get_all_in_workspace(workspace.id)
        .await?
        .iter()
        .map(|n| NoteSchema::from(n.clone()))
        .collect();

    Ok(Json(DataResponseSchema(notes)))
}
