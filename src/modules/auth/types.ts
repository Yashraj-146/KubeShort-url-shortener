/**
 * Request received from the frontend after
 * successful Google authentication.
 */
export interface GoogleAuthRequest {
  idToken: string;
}

/**
 * JWT payload issued by our backend.
 */
export interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * User information returned to the client.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

/**
 * Response returned after successful authentication.
 */
export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}