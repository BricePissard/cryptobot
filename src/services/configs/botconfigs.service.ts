/* eslint-disable no-magic-numbers */
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BotRequest } from '../../exchange/entities/exchange'

@Injectable()
export class BotConfigService {
  private readonly client
  // eslint-disable-next-line no-unused-vars
  constructor(private configs: ConfigService) {}

  get settings(): any {
    return this.configs.get<any>('configurations')
  }

  get rebalanceProfiles(): any[] | null {
    try {
      const PERCENT = 100
      const TEN = 10
      const rebalanceProfiles = this.configs
        .get<string[]>('configurations.rebalance')
        .map((item) => item.split(':'))
        .map((item) => ({
          asset: item[0],
          ratio: parseInt(item[1], TEN) / PERCENT
        }))
      return rebalanceProfiles
    } catch (error) {
      return null
    }
  }

  get tradeCurrency(): string {
    const rebalanceTo = this.configs.get<string>('configurations.trade_with')
    return rebalanceTo
  }

  get tradingPairs(): BotRequest[] | null {
    try {
      const pairs = this.configs
        .get<string[]>('configurations.trading_pairs')
        .map((item) => item.split(':'))
        .map((item) => ({
          asset: item[0],
          denominator: item[1]
        }))
      return pairs
    } catch (error) {
      return null
    }
  }
}
