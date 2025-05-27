use axum::extract::Request;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use axum::Router;
use axum::routing::get;
use tower_http::trace::TraceLayer;

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

    let router = Router::new()
        .layer(TraceLayer::new_for_http().make_span_with(|request: &Request<_>| {
            // Log the matched route's path (with placeholders not filled in).
            // Use request.uri() or OriginalUri if you want the real path.
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
        }))
        .route("/", get(|| async { "Hello, world!" }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    let addr = listener.local_addr().unwrap();
    tracing::info!("Listening on http://{}", addr);
    axum::serve(listener, router).await.unwrap();
}
