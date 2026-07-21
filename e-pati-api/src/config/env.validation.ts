const REQUIRED_IN_PRODUCTION = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'QR_TOKEN_SECRET',
  'CORS_ORIGINS',
] as const;

const PLACEHOLDER_PATTERNS = [
  /^change-this/i,
  /^replace-with/i,
  /^postgresql:\/\/USER:PASSWORD@HOST/i,
  /^rediss?:\/\/USER:PASSWORD@HOST/i,
];

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const nodeEnv = String(config.NODE_ENV ?? 'development');

  if (nodeEnv !== 'production') {
    return config;
  }

  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(', ')}`,
    );
  }

  const placeholders = REQUIRED_IN_PRODUCTION.filter((key) =>
    isPlaceholder(String(config[key])),
  );
  if (placeholders.length > 0) {
    throw new Error(
      `Production environment variables contain placeholder values: ${placeholders.join(', ')}`,
    );
  }

  return config;
}

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}
