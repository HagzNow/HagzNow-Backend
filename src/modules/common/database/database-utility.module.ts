import { Global, Module } from '@nestjs/common';
import { TransactionManager } from './transaction-manager.service';

@Global() // 🌟 Makes the service available everywhere without re-importing the module
@Module({
  providers: [TransactionManager],
  exports: [TransactionManager],
})
export class DatabaseUtilityModule {}
