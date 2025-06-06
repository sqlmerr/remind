use crate::User;
use uuid::Uuid;

#[derive(Clone, Debug)]
pub struct UserDTO {
    pub id: Uuid,
    pub username: String,
    pub email: String,
}

#[derive(Debug, Clone)]
pub struct UserCreateDTO {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Clone)]
pub struct UserLoginUsernameDTO {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Clone)]
pub struct UserLoginEmailDTO {
    pub email: String,
    pub password: String,
}

impl From<User> for UserDTO {
    fn from(value: User) -> Self {
        Self {
            id: value.id,
            username: value.username,
            email: value.email,
        }
    }
}
