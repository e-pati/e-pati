import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [PetsController],
  providers: [PetsService],
})
export class PetsModule {}
