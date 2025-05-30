mod fixtures;

use crate::fixtures::{create_user_fixture, create_user_repository, create_user_service};
use remind_auth::{DecodingKey, EncodingKey, JwtProcessor};
use remind_core::{UserCreateDTO, UserLoginEmailDTO, UserLoginUsernameDTO, UserService};
use sqlx::PgPool;

#[sqlx::test(migrations = "../../migrations")]
async fn test_register_user(db: PgPool) {
    let user_service = create_user_service(db);

    let dto = UserCreateDTO {
        username: "Test".to_string(),
        email: "test@example.com".to_string(),
        password: "somepass".to_string(),
    };
    let user = user_service.register(dto.clone()).await.unwrap();

    assert_eq!(user.username, dto.username);
    assert_eq!(user.email, dto.email);
}

#[sqlx::test(migrations = "../../migrations")]
async fn test_login_by_username(db: PgPool) {
    let user_repo = create_user_repository(db);
    let jwt_processor = JwtProcessor::new(
        EncodingKey::from_secret("somesecret".as_bytes()),
        DecodingKey::from_secret("somesecret".as_bytes()),
    );
    let user_service = UserService::new(user_repo.clone(), jwt_processor.clone());

    let user = fixtures::create_user_fixture(user_repo).await;

    let token = user_service
        .login_by_username(UserLoginUsernameDTO {
            username: user.username.clone(),
            password: "password".to_string(),
        })
        .await
        .unwrap();

    let claims = jwt_processor.decode_token(token.as_str()).unwrap();
    assert_eq!(claims.sub, user.username);

    let token2 = user_service
        .login_by_username(UserLoginUsernameDTO {
            username: "fakeUsername".to_string(),
            password: "password".to_string(),
        })
        .await;
    assert!(token2.is_err());

    let token3 = user_service
        .login_by_username(UserLoginUsernameDTO {
            username: user.username,
            password: "fakePassword".to_string(),
        })
        .await;
    assert!(token3.is_err())
}

#[sqlx::test(migrations = "../../migrations")]
async fn test_login_by_email(db: PgPool) {
    let user_repo = create_user_repository(db);
    let jwt_processor = JwtProcessor::new(
        EncodingKey::from_secret("somesecret".as_bytes()),
        DecodingKey::from_secret("somesecret".as_bytes()),
    );
    let user_service = UserService::new(user_repo.clone(), jwt_processor.clone());

    let user = create_user_fixture(user_repo).await;

    let token = user_service
        .login_by_email(UserLoginEmailDTO {
            email: "test2@example.com".to_string(),
            password: "password".to_string(),
        })
        .await
        .unwrap();

    let claims = jwt_processor.decode_token(token.as_str()).unwrap();
    assert_eq!(claims.sub, user.username);

    let token2 = user_service
        .login_by_email(UserLoginEmailDTO {
            email: "fake@example.com".to_string(),
            password: "password".to_string(),
        })
        .await;
    assert!(token2.is_err());

    let token3 = user_service
        .login_by_email(UserLoginEmailDTO {
            email: "test2@example.com".to_string(),
            password: "fakePassword".to_string(),
        })
        .await;
    assert!(token3.is_err());
}
