import { Injectable } from '@nestjs/common';
import { ErrorTrackerService } from './error-tracker/error-tracker.service';

@Injectable()
export class AppService {
    constructor(
        private errorTrackerService: ErrorTrackerService,
    ) {
        errorTrackerService.start();
    }
}
