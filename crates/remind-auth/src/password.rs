use argon2::{
    Argon2,
    password_hash::{
        PasswordHash, PasswordHasher, PasswordVerifier, Result, SaltString, rand_core::OsRng,
    },
};

pub fn hash_password(password: &[u8]) -> Result<String> {
    let argon2 = Argon2::default();
    let salt = SaltString::generate(&mut OsRng);
    let hash = argon2.hash_password(password, &salt)?.to_string();
    Ok(hash)
}

/// Will be error if not verified
pub fn verify_password(password: String, hashed_password: String) -> Result<()> {
    let argon2 = Argon2::default();
    let hash = PasswordHash::new(&hashed_password)?;

    argon2.verify_password(password.as_bytes(), &hash)
}
