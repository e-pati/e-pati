import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { TokenPayload } from './types/token-payload';

type RequestWithCookies = Request & {
  cookies?: {
    refreshToken?: string;
  };
};

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ description: 'Owner account created.' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const auth = await this.authService.register(dto);
    this.setRefreshCookie(response, auth.refreshToken);
    return this.withoutRefreshToken(auth);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Owner logged in.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const auth = await this.authService.login(dto);
    this.setRefreshCookie(response, auth.refreshToken);
    return this.withoutRefreshToken(auth);
  }

  @Post('clinic/login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Clinic staff logged in.' })
  async loginClinic(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const auth = await this.authService.loginClinic(dto);
    this.setRefreshCookie(response, auth.refreshToken);
    return this.withoutRefreshToken(auth);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Access token refreshed.' })
  async refresh(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ) {
    const auth = await this.authService.refresh(request.cookies?.refreshToken);
    this.setRefreshCookie(response, auth.refreshToken);
    return this.withoutRefreshToken(auth);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(request.cookies?.refreshToken);
    response.clearCookie(REFRESH_COOKIE_NAME);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Current JWT payload.' })
  me(@CurrentUser() user: TokenPayload) {
    return user;
  }

  private setRefreshCookie(response: Response, refreshToken: string): void {
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
      path: '/auth',
    });
  }

  private withoutRefreshToken(auth: {
    accessToken: string;
    refreshToken: string;
    user: unknown;
  }) {
    return {
      accessToken: auth.accessToken,
      user: auth.user,
    };
  }
}
