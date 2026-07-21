import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from './types/token-payload';

type RequestWithCookies = Request & {
  cookies?: {
    accessToken?: string;
  };
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: RequestWithCookies) => request.cookies?.accessToken ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ??
        'replace-with-access-token-secret',
    });
  }

  validate(payload: TokenPayload): TokenPayload {
    return payload;
  }
}
