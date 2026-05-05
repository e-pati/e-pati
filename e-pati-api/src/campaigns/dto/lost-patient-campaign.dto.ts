import { ArrayMinSize, IsArray, IsIn, IsString } from 'class-validator';

export class LostPatientCampaignDto {
  @IsIn(['whatsapp', 'sms'])
  channel!: 'whatsapp' | 'sms';

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  candidateIds!: string[];

  @IsString()
  message!: string;
}
