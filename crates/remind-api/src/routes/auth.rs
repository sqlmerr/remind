use crate::errors::Result;
use crate::schemas::auth::{
    AuthTokenSchema, LoginByEmailSchema, LoginByUsernameSchema, RegisterUserSchema,
};
use crate::schemas::user::UserSchema;
use crate::state::AppState;
use crate::utils::validator::ValidatedJson;
use axum::extract::State;
use axum::routing::{get, post};
use axum::{Extension, Json, Router};
use remind_core::UserDTO;

pub(crate) fn router(state: AppState) -> Router<AppState> {
    Router::new()
        .route("/register", post(register))
        .route("/login/username", post(login_by_username))
        .route("/login/email", post(login_by_email))
        .route(
            "/me",
            get(get_me).layer(axum::middleware::from_fn_with_state(
                state,
                super::auth_middleware,
            )),
        )
}

async fn register(
    State(state): State<AppState>,
    ValidatedJson(data): ValidatedJson<RegisterUserSchema>,
) -> Result<Json<UserSchema>> {
    let dto = data.into();
    let response = state.user_service.register(dto).await?;

    Ok(Json(response.into()))
}

async fn login_by_username(
    State(state): State<AppState>,
    Json(data): Json<LoginByUsernameSchema>,
) -> Result<Json<AuthTokenSchema>> {
    let dto = data.into();
    let token = state.user_service.login_by_username(dto).await?;
    Ok(Json(AuthTokenSchema {
        access_token: token,
        token_type: "Bearer".to_string(),
    }))
}

async fn login_by_email(
    State(state): State<AppState>,
    ValidatedJson(data): ValidatedJson<LoginByEmailSchema>,
) -> Result<Json<AuthTokenSchema>> {
    let dto = data.into();
    let token = state.user_service.login_by_email(dto).await?;
    Ok(Json(AuthTokenSchema {
        access_token: token,
        token_type: "Bearer".to_string(),
    }))
}

async fn get_me(Extension(user): Extension<UserDTO>) -> Json<UserSchema> {
    Json(user.into())
}
