use remind_core::UserDTO;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserSchema {
    pub id: Uuid,
    pub username: String,
    pub email: String,
}

impl From<UserDTO> for UserSchema {
    fn from(user_dto: UserDTO) -> Self {
        Self {
            id: user_dto.id,
            username: user_dto.username,
            email: user_dto.email,
        }
    }
}
