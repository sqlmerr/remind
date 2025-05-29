extern crate argon2;
pub(crate) mod claims;
pub(crate) mod errors;
pub(crate) mod jwt;
mod password;

pub use claims::Claims;
pub use errors::AuthError;
pub use jwt::{JwtProcessor, create_token, decode_token};
pub use password::{hash_password, verify_password};

pub use jsonwebtoken::{DecodingKey, EncodingKey};
