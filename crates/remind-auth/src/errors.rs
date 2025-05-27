#[derive(thiserror::Error, Debug)]
pub enum AuthError {
    #[error("Wrong credentials")]
    WrongCredentials,
    #[error("Missing credentials")]
    MissingCredentials,
    #[error("Token creation error")]
    TokenCreation,
    #[error("Invalid token")]
    InvalidToken,
    #[error("This username is already occupied!")]
    UsernameOccupied,
    #[error("This email already exists!")]
    EmailExists,
}