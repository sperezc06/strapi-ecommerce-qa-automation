export interface RequestSignInCredential {
  email: string;
  password: string;
}

export interface RequestSignInWithProviders {
  provider?: string;
  access_token?: string;
}

export interface RequestSignUpCredential {
  name: string;
  email: string;
  password: string;
}

export interface ResponseAuth {
  user: {
    email: string;
    name?: string;
    username?: string;
    blocked: boolean;
    id: number | string;
    provider?: string;
    confirmed?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  jwt: string;
}
