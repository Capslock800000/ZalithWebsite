export interface User {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
