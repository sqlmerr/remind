pub mod config;
pub mod errors;
pub mod routes;
pub mod schemas;
pub mod state;
pub mod utils;

use crate::config::Config;
use crate::state::AppState;
use axum::extract::Request;
use axum::http::HeaderValue;
use axum::routing::get;
use axum::{Json, Router, http};
use remind_core::PgPoolOptions;
use serde_json::json;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                format!(
                    "{}=debug,tower_http=debug,axum::rejection=trace",
                    env!("CARGO_CRATE_NAME")
                )
                .into()
            }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::from_env();
    let db_pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(config.database_url.as_str())
        .await
        .unwrap();

    let state = AppState::new(db_pool, config);
    let cors = CorsLayer::new()
        .allow_methods([
            http::Method::GET,
            http::Method::POST,
            http::Method::PUT,
            http::Method::DELETE,
            http::Method::OPTIONS,
        ])
        .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
        .allow_headers([http::header::CONTENT_TYPE, http::header::AUTHORIZATION])
        .allow_credentials(false);
    let router = Router::new()
        .route(
            "/",
            get(|| async { Json(json!({"message": "Hello, world!", "ok": true})) }),
        )
        .nest("/auth", routes::auth::router(state.clone()))
        .nest("/workspaces", routes::workspace::router(state.clone()))
        .nest("/notes", routes::note::router(state.clone()))
        .nest("/blocks", routes::block::router(state.clone()))
        .fallback(routes::handler_404)
        .layer(
            TraceLayer::new_for_http().make_span_with(|request: &Request<_>| {
                let matched_path = request
                    .extensions()
                    .get::<axum::extract::MatchedPath>()
                    .map(axum::extract::MatchedPath::as_str);

                tracing::info_span!(
                    "http_request",
                    method = ?request.method(),
                    matched_path,
                    some_other_field = tracing::field::Empty,
                )
            }),
        )
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    let addr = listener.local_addr().unwrap();
    tracing::info!("Listening on http://{}", addr);
    axum::serve(listener, router).await.unwrap();
}
