import { IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export class CheckoutDto {
  @IsOptional()
  @IsIn(['monthly', 'yearly'])
  plan?: 'monthly' | 'yearly';

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  successUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  cancelUrl?: string;
}
