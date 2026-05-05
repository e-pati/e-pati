import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { OwnerSubscriptionsController } from './owner-subscriptions.controller';
import { SubscriptionController } from './subscription.controller';
import { BillingService } from './billing.service';

@Module({
  controllers: [
    BillingController,
    SubscriptionController,
    OwnerSubscriptionsController,
  ],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
