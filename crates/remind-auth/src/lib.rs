extern crate argon2;
pub(crate) mod claims;
pub(crate) mod jwt;
pub(crate) mod errors;
mod password;

pub use jwt::{create_token, decode_token, JwtProcessor};
pub use password::{hash_password, verify_password};
pub use errors::AuthError;
pub use claims::Claims;

pub use jsonwebtoken::{EncodingKey, DecodingKey};
