use uuid::Uuid;
use remind_auth::{hash_password, verify_password, Claims, JwtProcessor};
use crate::repositories::user::UserRepo;
use crate::{User, UserCreateDTO, UserDTO, UserLoginEmailDTO, UserLoginUsernameDTO};
use crate::errors::AuthError;
use crate::errors::CoreError;
use crate::errors::Result;

#[derive(Clone)]
pub struct UserService<R: UserRepo> {
    repo: R,
    jwt_processor: JwtProcessor
}

impl<R: UserRepo> UserService<R> {
    pub fn new(repo: R, jwt_processor: JwtProcessor) -> Self {
        Self { repo, jwt_processor }
    }

    pub async fn register(&self, data: UserCreateDTO) -> Result<UserDTO> {
        if let Some(_) = self.repo.find_one_by_username(data.username.clone()).await? {
            return Err(AuthError::UsernameOccupied.into())
        };
        if let Some(_) = self.repo.find_one_by_email(data.email.clone()).await? {
            return Err(AuthError::EmailExists.into())
        };
        let password = hash_password(data.password.as_ref()).map_err(|_| CoreError::ServerError)?;
        let user = User {
            id: Uuid::new_v4(),
            username: data.username,
            email: data.email,
            password,
        };
        self.repo.create(user.clone()).await?;

        let dto = self.find_one(user.id).await?;
        Ok(dto)
    }

    pub async fn find_one(&self, id: Uuid) -> Result<UserDTO> {
        let user = self.repo.find_one(id).await?;
        match user {
            None => Err(CoreError::NotFound),
            Some(usr) => Ok(usr.into())
        }
    }

    pub async fn find_one_by_username(&self, username: String) -> Result<UserDTO> {
        let user = self.repo.find_one_by_username(username).await?;
        match user {
            None => Err(CoreError::NotFound),
            Some(usr) => Ok(usr.into())
        }
    }

    pub async fn login_by_username(&self, data: UserLoginUsernameDTO) -> Result<String> {
        let user = self.repo.find_one_by_username(data.username.clone()).await?;
        if user.is_none() {
            return Err(AuthError::WrongCredentials.into());
        }
        let user = user.unwrap();
        if !verify_password(data.password, user.password).is_ok() {
            return Err(AuthError::WrongCredentials.into());
        }

        let claims = Claims::new(data.username);
        let token = self.jwt_processor.create_token(&claims)?;
        Ok(token)
    }

    pub async fn login_by_email(&self, data: UserLoginEmailDTO) -> Result<String> {
        let user = self.repo.find_one_by_email(data.email.clone()).await?;
        if user.is_none() {
            return Err(AuthError::WrongCredentials.into());
        }
        let user = user.unwrap();
        if !verify_password(data.password, user.password).is_ok() {
            return Err(AuthError::WrongCredentials.into());
        }

        let claims = Claims::new(user.username);
        let token = self.jwt_processor.create_token(&claims)?;
        Ok(token)
    }
}