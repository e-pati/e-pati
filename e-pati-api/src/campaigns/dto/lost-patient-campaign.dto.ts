import { IsArray, IsIn, IsString } from 'class-validator';

export class LostPatientCampaignDto {
  @IsIn(['whatsapp', 'sms'])
  channel!: 'whatsapp' | 'sms';

  @IsArray()
  @IsString({ each: true })
  candidateIds!: string[];

  @IsString()
  message!: string;
}
