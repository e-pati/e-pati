import type { NextFunction, Request, Response } from 'express';
import {
  createUnsafeRequestOriginGuard,
  parseTrustedOrigins,
} from './origin-guard.middleware';

function runGuard(request: Partial<Request>) {
  const next = jest.fn<ReturnType<NextFunction>, Parameters<NextFunction>>();
  const guard = createUnsafeRequestOriginGuard([
    'https://portal.example.gov.tr',
    'http://localhost:3001',
  ]);

  guard(request as Request, {} as Response, next);
  return next;
}

describe('createUnsafeRequestOriginGuard', () => {
  it('allows safe requests without origin headers', () => {
    const next = runGuard({
      method: 'GET',
      headers: {},
    });

    expect(next).toHaveBeenCalledWith();
  });

  it('allows unsafe requests from a trusted origin', () => {
    const next = runGuard({
      method: 'POST',
      headers: {
        origin: 'https://portal.example.gov.tr',
      },
    });

    expect(next).toHaveBeenCalledWith();
  });

  it('allows unsafe requests from a trusted referer', () => {
    const next = runGuard({
      method: 'PATCH',
      headers: {
        referer: 'http://localhost:3001/appointments/123',
      },
    });

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects unsafe requests without origin or referer headers', () => {
    const next = runGuard({
      method: 'DELETE',
      headers: {},
    });

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
      }),
    );
  });

  it('allows native bearer-auth unsafe requests without origin headers', () => {
    const next = runGuard({
      method: 'POST',
      headers: {
        authorization: 'Bearer mobile.jwt',
      },
    });

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects bearer requests without origin headers when auth cookies are present', () => {
    const next = runGuard({
      method: 'POST',
      headers: {
        authorization: 'Bearer browser.jwt',
        cookie: 'accessToken=cookie.jwt',
      },
      cookies: {
        accessToken: 'cookie.jwt',
      },
    } as Partial<Request> & { cookies: Record<string, string> });

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
      }),
    );
  });

  it('allows signed WhatsApp webhooks without origin headers', () => {
    const next = runGuard({
      method: 'POST',
      path: '/whatsapp/webhook',
      headers: {
        'x-hub-signature-256': 'sha256=signature',
      },
    });

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects unsigned WhatsApp webhooks without origin headers', () => {
    const next = runGuard({
      method: 'POST',
      path: '/whatsapp/webhook',
      headers: {},
    });

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
      }),
    );
  });

  it('rejects unsigned billing webhooks without origin headers', () => {
    const next = runGuard({
      method: 'POST',
      path: '/billing/webhook',
      headers: {},
    });

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
      }),
    );
  });

  it('rejects unsafe requests from an untrusted origin', () => {
    const next = runGuard({
      method: 'POST',
      headers: {
        origin: 'https://evil.example',
      },
    });

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
      }),
    );
  });
});

describe('parseTrustedOrigins', () => {
  it('trims comma-separated origin config', () => {
    expect(
      parseTrustedOrigins(
        ' https://portal.example.gov.tr, http://localhost:3001 ',
      ),
    ).toEqual(['https://portal.example.gov.tr', 'http://localhost:3001']);
  });
});
