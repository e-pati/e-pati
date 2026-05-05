import { IsString } from 'class-validator';

export class ConnectWhatsAppDto {
  @IsString()
  phoneNumber!: string;
}
