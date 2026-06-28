export interface CreateShortLinkDto {
  originalUrl: string;
  customAlias?: string;
  expiresAt?: Date;
  userId: string;
}

export interface ShortLinkResponse {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface RedirectResponse {
  originalUrl: string;
}

export interface RedirectDto {
  shortCode: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RedirectResult {
  originalUrl: string;
}