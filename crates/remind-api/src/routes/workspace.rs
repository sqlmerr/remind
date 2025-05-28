use axum::extract::State;
use axum::{Extension, Json, Router};
use axum::routing::{get, post};
use remind_core::{UserDTO, WorkspaceCreateDTO};
use crate::schemas::workspace::{CreateWorkspaceSchema, WorkspaceSchema};
use crate::state::AppState;
use crate::errors::Result;
use crate::schemas::DataResponseSchema;

pub(crate) fn router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/", post(create_workspace))
        .route("/my", get(get_my_workspaces))
        .layer(axum::middleware::from_fn_with_state(state, super::auth_middleware))
}

async fn create_workspace(
    State(state): State<AppState>,
    Extension(user): Extension<UserDTO>,
    Json(data): Json<CreateWorkspaceSchema>
) -> Result<Json<WorkspaceSchema>> {
    let response = state.workspace_service.create(WorkspaceCreateDTO {title: data.title, user_id: user.id}).await?;
    Ok(Json(response.into()))
}

async fn get_my_workspaces(
    State(state): State<AppState>,
    Extension(user): Extension<UserDTO>
) -> Result<Json<DataResponseSchema<Vec<WorkspaceSchema>>>> {  
    let workspaces: Vec<WorkspaceSchema> = state.workspace_service.get_all_by_user(user.id)
        .await?.iter().map(|w| WorkspaceSchema::from(w.clone())).collect();
    
    Ok(Json(DataResponseSchema(workspaces)))
}