import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  it('allows incomplete development config', () => {
    expect(validateEnvironment({ NODE_ENV: 'development' })).toEqual({
      NODE_ENV: 'development',
    });
  });

  it('rejects missing production config', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'production' })).toThrow(
      /Missing required production environment variables/,
    );
  });

  it('rejects placeholder production config', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://USER:PASSWORD@HOST:5432/DATABASE',
        REDIS_URL: 'rediss://USER:PASSWORD@HOST:6379',
        JWT_ACCESS_SECRET: 'replace-with-access-token-secret',
        JWT_REFRESH_SECRET: 'replace-with-refresh-token-secret',
        QR_TOKEN_SECRET: 'replace-with-qr-token-secret',
        CORS_ORIGINS: 'https://portal.example.gov.tr',
      }),
    ).toThrow(/placeholder values/);
  });

  it('allows complete production config', () => {
    const config = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://epati:secret@db.internal:5432/epati',
      REDIS_URL: 'redis://redis.internal:6379',
      JWT_ACCESS_SECRET: 'access-secret-with-enough-entropy',
      JWT_REFRESH_SECRET: 'refresh-secret-with-enough-entropy',
      QR_TOKEN_SECRET: 'qr-secret-with-enough-entropy',
      CORS_ORIGINS: 'https://portal.example.gov.tr',
    };

    expect(validateEnvironment(config)).toBe(config);
  });
});
