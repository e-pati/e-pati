import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
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
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { TokenPayload } from './types/token-payload';

type RequestWithCookies = Request & {
  cookies?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

const ACCESS_COOKIE_NAME = 'accessToken';
const REFRESH_COOKIE_NAME = 'refreshToken';
const ACCESS_COOKIE_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE_SAME_SITE_VALUES = ['lax', 'none', 'strict'] as const;
type CookieSameSite = (typeof COOKIE_SAME_SITE_VALUES)[number];

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ description: 'Owner account created pending OTP.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'OTP sent to owner email.' })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Owner email verified and logged in.' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const auth = await this.authService.verifyOtp(dto);
    this.setAccessCookie(response, auth.accessToken);
    this.setRefreshCookie(response, auth.refreshToken);
    return this.withoutTokens(auth);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Owner logged in.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const auth = await this.authService.login(dto);
    this.setAccessCookie(response, auth.accessToken);
    this.setRefreshCookie(response, auth.refreshToken);
    return this.withoutTokens(auth);
  }

  @Post('clinic/login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Clinic staff logged in.' })
  async loginClinic(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const auth = await this.authService.loginClinic(dto);
    this.setAccessCookie(response, auth.accessToken);
    this.setRefreshCookie(response, auth.refreshToken);
    return this.withoutTokens(auth);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Access token refreshed.' })
  async refresh(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ) {
    const auth = await this.authService.refresh(request.cookies?.refreshToken);
    this.setAccessCookie(response, auth.accessToken);
    this.setRefreshCookie(response, auth.refreshToken);
    return this.withoutTokens(auth);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(request.cookies?.refreshToken);
    response.clearCookie(ACCESS_COOKIE_NAME, this.getCookieOptions('/'));
    response.clearCookie(REFRESH_COOKIE_NAME, this.getCookieOptions('/auth'));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Current user profile.' })
  me(@CurrentUser() user: TokenPayload) {
    return this.authService.me(user);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Password changed.' })
  changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.authService.changePassword(dto, user);
  }

  private setRefreshCookie(response: Response, refreshToken: string): void {
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      ...this.getCookieOptions('/auth'),
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });
  }

  private setAccessCookie(response: Response, accessToken: string): void {
    response.cookie(ACCESS_COOKIE_NAME, accessToken, {
      ...this.getCookieOptions('/'),
      maxAge: ACCESS_COOKIE_MAX_AGE_MS,
    });
  }

  private getCookieOptions(path: string) {
    return {
      httpOnly: true,
      sameSite: this.getCookieSameSite(),
      secure: this.getCookieSecure(),
      path,
    };
  }

  private getCookieSecure(): boolean {
    const configured = process.env.AUTH_COOKIE_SECURE?.toLowerCase();

    if (configured === 'true') {
      return true;
    }

    if (configured === 'false') {
      return false;
    }

    return process.env.NODE_ENV === 'production';
  }

  private getCookieSameSite(): CookieSameSite {
    const configured = process.env.AUTH_COOKIE_SAME_SITE?.toLowerCase();

    if (COOKIE_SAME_SITE_VALUES.includes(configured as CookieSameSite)) {
      return configured as CookieSameSite;
    }

    return process.env.NODE_ENV === 'production' ? 'none' : 'lax';
  }

  private withoutTokens(auth: {
    accessToken: string;
    refreshToken: string;
    user: unknown;
  }) {
    return {
      user: auth.user,
    };
  }
}
