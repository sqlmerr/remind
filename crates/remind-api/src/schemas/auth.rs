use remind_core::{UserCreateDTO, UserLoginEmailDTO, UserLoginUsernameDTO};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Clone, Debug, Serialize, Deserialize, Validate)]
pub struct RegisterUserSchema {
    pub username: String,
    #[validate(email)]
    pub email: String,
    pub password: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct LoginByUsernameSchema {
    pub username: String,
    pub password: String,
}

#[derive(Clone, Debug, Serialize, Deserialize, Validate)]
pub struct LoginByEmailSchema {
    #[validate(email)]
    pub email: String,
    pub password: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AuthTokenSchema {
    pub access_token: String,
    pub token_type: String,
}

impl Into<UserLoginUsernameDTO> for LoginByUsernameSchema {
    fn into(self) -> UserLoginUsernameDTO {
        UserLoginUsernameDTO {
            username: self.username,
            password: self.password,
        }
    }
}

impl Into<UserLoginEmailDTO> for LoginByEmailSchema {
    fn into(self) -> UserLoginEmailDTO {
        UserLoginEmailDTO {
            email: self.email,
            password: self.password,
        }
    }
}

impl Into<UserCreateDTO> for RegisterUserSchema {
    fn into(self) -> UserCreateDTO {
        UserCreateDTO {
            username: self.username,
            email: self.email,
            password: self.password,
        }
    }
}
