import { ForbiddenException } from '@nestjs/common';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

const UNSAFE_METHODS = new Set(['DELETE', 'PATCH', 'POST', 'PUT']);
const AUTH_COOKIE_NAMES = new Set(['accessToken', 'refreshToken']);

type RequestWithCookies = Request & {
  cookies?: Record<string, string | undefined>;
};

type OriginGuardOptions = {
  signedWebhookPaths?: string[];
};

export function createUnsafeRequestOriginGuard(
  allowedOrigins: string[],
  options: OriginGuardOptions = {},
): RequestHandler {
  const allowedOriginSet = new Set(
    allowedOrigins.map((origin) => normalizeOrigin(origin)).filter(Boolean),
  );
  const signedWebhookPaths = new Set(
    options.signedWebhookPaths ?? ['/whatsapp/webhook', '/billing/webhook'],
  );

  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!UNSAFE_METHODS.has(request.method.toUpperCase())) {
      next();
      return;
    }

    if (isSignedWebhookRequest(request, signedWebhookPaths)) {
      next();
      return;
    }

    if (isBearerOnlyRequest(request)) {
      next();
      return;
    }

    const requestOrigin = getRequestOrigin(request);
    if (!requestOrigin) {
      next(new ForbiddenException('Origin or Referer header is required.'));
      return;
    }

    if (!allowedOriginSet.has(requestOrigin)) {
      next(new ForbiddenException('Origin is not allowed.'));
      return;
    }

    next();
  };
}

export function parseTrustedOrigins(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getRequestOrigin(request: Request): string | null {
  const origin = getHeaderValue(request, 'origin');
  if (origin) {
    return normalizeOrigin(origin);
  }

  const referer = getHeaderValue(request, 'referer');
  if (!referer) {
    return null;
  }

  return normalizeOrigin(referer);
}

function getHeaderValue(request: Request, name: string): string | undefined {
  const value = request.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function isBearerOnlyRequest(request: Request): boolean {
  const authorization = getHeaderValue(request, 'authorization');
  return Boolean(
    authorization?.startsWith('Bearer ') && !hasAuthCookie(request),
  );
}

function isSignedWebhookRequest(
  request: Request,
  signedWebhookPaths: Set<string>,
): boolean {
  const path = getRequestPath(request);
  return (
    signedWebhookPaths.has(path) &&
    getSignatureHeadersForPath(path).some((header) =>
      Boolean(getHeaderValue(request, header)),
    )
  );
}

function getSignatureHeadersForPath(path: string): string[] {
  if (path === '/whatsapp/webhook') {
    return ['x-hub-signature-256'];
  }

  if (path === '/billing/webhook') {
    return ['x-vetcep-signature'];
  }

  return ['x-hub-signature-256', 'x-vetcep-signature'];
}

function hasAuthCookie(request: Request): boolean {
  const cookies = (request as RequestWithCookies).cookies ?? {};
  if (Object.keys(cookies).some((name) => AUTH_COOKIE_NAMES.has(name))) {
    return true;
  }

  const cookieHeader = getHeaderValue(request, 'cookie') ?? '';
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .some((name) => AUTH_COOKIE_NAMES.has(name));
}

function getRequestPath(request: Request): string {
  return (request.path ?? request.originalUrl ?? request.url ?? '').split(
    '?',
  )[0];
}

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
