import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ErrorTrackerService } from './error-tracker.service';

@ApiTags('monitoring')
@Controller('monitoring')
export class ErrorTrackerController {
  constructor(
    private readonly trackerService: ErrorTrackerService
  ) { }

  @Get('/info')
  getInfo() {
    return this.trackerService.getInfo();
  }

  @Get('/synced')
  getLife() {
    const info = this.trackerService.getInfo();

    return info.hmyLzEndpoint.info.progress === "1.0000" &&
      info.hmyMultisig.info.progress === "1.0000";
  }

  @Get('/events')
  getEvents(@Query() query: any) {
    return this.trackerService.getEvents(query);
  }
}
