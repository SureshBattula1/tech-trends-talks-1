export interface User {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  middle_name: string | null;
  email: string;
  role: string;
  email_verified_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    token_type: string;
  };
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  middle_name?: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    access_token: string;
    token_type: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
