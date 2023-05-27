import { Module } from '@nestjs/common';
import { ErrorTrackerService } from './error-tracker.service';
import { ConfigModule } from '@nestjs/config';
import { ErrorTrackerController } from './error-tracker.controller';
import { Events } from 'src/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Events]),
  ],
  providers: [ErrorTrackerService],
  exports: [ErrorTrackerService],
  controllers: [ErrorTrackerController],
})
export class ErrorTrackerModule {}
