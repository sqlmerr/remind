export interface RegisterUser {
  username: string;
  email: string;
  password: string;
}

export interface LoginByUsername {
  username: string;
  password: string;
}

export interface LoginByEmail {
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}
