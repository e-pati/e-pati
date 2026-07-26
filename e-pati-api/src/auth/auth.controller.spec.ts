import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const authResponse = {
  accessToken: 'access.jwt',
  refreshToken: 'refresh-token',
  user: {
    id: 'user-1',
    email: 'owner@example.com',
    fullName: 'Owner User',
    role: 'OWNER',
  },
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    verifyOtp: jest.Mock;
    login: jest.Mock;
    loginClinic: jest.Mock;
    refresh: jest.Mock;
  };
  let cookie: jest.Mock;
  let response: Response;

  beforeEach(() => {
    authService = {
      verifyOtp: jest.fn().mockResolvedValue(authResponse),
      login: jest.fn().mockResolvedValue(authResponse),
      loginClinic: jest.fn().mockResolvedValue(authResponse),
      refresh: jest.fn().mockResolvedValue(authResponse),
    };
    cookie = jest.fn();
    response = {
      cookie,
    } as unknown as Response;

    controller = new AuthController(authService as unknown as AuthService);
  });

  it('returns only the user from owner login while setting auth cookies', async () => {
    await expect(
      controller.login(
        { email: 'owner@example.com', password: 'password' },
        response,
      ),
    ).resolves.toEqual({ user: authResponse.user });

    expect(cookie).toHaveBeenCalledWith(
      'accessToken',
      authResponse.accessToken,
      expect.objectContaining({ httpOnly: true }),
    );
    expect(cookie).toHaveBeenCalledWith(
      'refreshToken',
      authResponse.refreshToken,
      expect.objectContaining({ httpOnly: true }),
    );
  });

  it('returns only the user from clinic login', async () => {
    await expect(
      controller.loginClinic(
        { email: 'clinic@example.com', password: 'password' },
        response,
      ),
    ).resolves.toEqual({ user: authResponse.user });
  });

  it('returns only the user from otp verification', async () => {
    await expect(
      controller.verifyOtp(
        { email: 'owner@example.com', code: '123456' },
        response,
      ),
    ).resolves.toEqual({ user: authResponse.user });
  });

  it('returns only the user from refresh', async () => {
    await expect(
      controller.refresh(
        { cookies: { refreshToken: authResponse.refreshToken } } as never,
        response,
      ),
    ).resolves.toEqual({ user: authResponse.user });
  });
});
