use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    /// Username
    pub sub: String,
    /// Expiration
    pub exp: usize,
}

impl Claims {
    pub fn new(username: String) -> Self {
        Self {
            sub: username,
            exp: (Utc::now() + Duration::minutes(30)).timestamp() as usize,
        }
    }
}
