import { ForbiddenException } from '@nestjs/common';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

const UNSAFE_METHODS = new Set(['DELETE', 'PATCH', 'POST', 'PUT']);

export function createUnsafeRequestOriginGuard(
  allowedOrigins: string[],
): RequestHandler {
  const allowedOriginSet = new Set(
    allowedOrigins.map((origin) => normalizeOrigin(origin)).filter(Boolean),
  );

  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!UNSAFE_METHODS.has(request.method.toUpperCase())) {
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

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
