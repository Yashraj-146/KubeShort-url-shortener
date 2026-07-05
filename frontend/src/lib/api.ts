const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface AuthSession {
  accessToken: string;
  user: ApiUser;
}

export interface ShortLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl?: string;
  title?: string | null;
  expiresAt: string | null;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Click {
  id: string;
  clickedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  referer: string | null;
  shortLinkId: string;
}

export interface AnalyticsResponse {
  shortLink: ShortLink;
  totalClicks: number;
  recentClicks: Click[];
}

export interface CreateUrlInput {
  originalUrl: string;
  customAlias?: string;
  expiresAt?: string;
}

interface ApiErrorResponse {
  message?: string;
  errors?: unknown;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json().catch(() => ({}))) as
    | T
    | ApiErrorResponse;

  if (!response.ok) {
    const errorBody = body as ApiErrorResponse;
    const message = errorBody.message || "Something went wrong.";
    throw new ApiError(message, response.status);
  }

  return body as T;
}

export const api = {
  baseUrl: API_BASE_URL,

  health() {
    return request<{ status: string }>("/api/v1/health");
  },

  googleLogin(idToken: string) {
    return request<AuthSession>("/api/v1/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  },

  listUrls(token: string) {
    return request<ShortLink[]>("/api/v1/urls", {}, token);
  },

  createUrl(input: CreateUrlInput, token: string) {
    return request<ShortLink>(
      "/api/v1/urls",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      token
    );
  },

  deleteUrl(id: string, token: string) {
    return request<void>(
      `/api/v1/urls/${id}`,
      { method: "DELETE" },
      token
    );
  },

  analytics(id: string, token: string) {
    return request<AnalyticsResponse>(
      `/api/v1/urls/${id}/analytics`,
      {},
      token
    );
  },
};
