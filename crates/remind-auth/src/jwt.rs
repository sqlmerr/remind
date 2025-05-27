use crate::claims::Claims;

use jsonwebtoken::{
    decode, encode, errors::Result, DecodingKey, EncodingKey, Header, TokenData, Validation,
};
use crate::AuthError;

pub fn create_token(claims: &Claims, key: &EncodingKey) -> Result<String> {
    encode(&Header::default(), claims, key)
}

pub fn decode_token(token: &str, key: &DecodingKey) -> Result<TokenData<Claims>> {
    decode::<Claims>(token, key, &Validation::default())
}

#[derive(Clone)]
pub struct JwtProcessor {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
}

impl JwtProcessor {
    pub fn new(encoding_key: EncodingKey, decoding_key: DecodingKey) -> Self {
        Self {
            encoding_key,
            decoding_key,
        }
    }

    pub fn create_token(&self, claims: &Claims) -> std::result::Result<String, AuthError> {
        let token = create_token(claims, &self.encoding_key);
        match token {
            Ok(token) => Ok(token),
            Err(_) => Err(AuthError::TokenCreation),
        }
    }

    pub fn decode_token(&self, token: &str) -> std::result::Result<Claims, AuthError> {
        match decode_token(token, &self.decoding_key) {
            Ok(token_data) => Ok(token_data.claims),
            Err(_) => Err(AuthError::InvalidToken),
        }
    }
}
