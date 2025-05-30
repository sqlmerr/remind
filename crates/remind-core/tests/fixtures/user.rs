#![allow(dead_code)]

use remind_auth::{DecodingKey, EncodingKey, JwtProcessor, hash_password};
use remind_core::{PgPool, User, UserRepo, UserRepository, UserService};
use uuid::Uuid;

pub async fn create_user_fixture<R: UserRepo>(user_repo: R) -> User {
    let user = User {
        id: Uuid::new_v4(),
        username: "testUsername".to_string(),
        email: "test2@example.com".to_string(),
        password: hash_password("password".as_bytes()).unwrap(),
    };
    user_repo.create(user.clone()).await.unwrap();
    user
}

pub fn create_user_repository(pool: PgPool) -> UserRepository {
    UserRepository::new(pool)
}

pub fn create_user_service(pool: PgPool) -> UserService<UserRepository> {
    let repo = create_user_repository(pool);
    let jwt_processor = JwtProcessor::new(
        EncodingKey::from_secret("somesecret".as_bytes()),
        DecodingKey::from_secret("somesecret".as_bytes()),
    );
    UserService::new(repo, jwt_processor)
}
