/* eslint-disable no-magic-numbers */
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Logger, LoggerTypes } from 'src/utils'
import { BotRequest } from '../../exchange/entities/exchange'

@Injectable()
export class BotConfigService {
  private config
  private readonly client
  // eslint-disable-next-line no-unused-vars
  constructor(private configs: ConfigService) {}

  get settings(): any {
    if (!this.config) {
      this.config = this.configs.get<any>('configurations')
      Logger.trace(LoggerTypes.SERVICE, 'BotConfigService.settings()', { config: this.config })
    }
    return this.config
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

      Logger.trace(LoggerTypes.SERVICE, 'BotConfigService.rebalanceProfiles()', {
        rebalanceProfiles: rebalanceProfiles
      })

      return rebalanceProfiles
    } catch (error) {
      Logger.trace(LoggerTypes.WARN, 'BotConfigService.rebalanceProfiles()', { error: error })
      return null
    }
  }

  get tradeCurrency(): string {
    const rebalanceTo = this.configs.get<string>('configurations.trade_with')

    Logger.trace(LoggerTypes.SERVICE, 'BotConfigService.tradeCurrency()', {
      rebalanceTo: rebalanceTo
    })

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

      Logger.trace(LoggerTypes.SERVICE, 'BotConfigService.tradingPairs()', {
        pairs: pairs
      })

      return pairs
    } catch (error) {
      Logger.trace(LoggerTypes.WARN, 'BotConfigService.tradingPairs()', { error: error })
      return null
    }
  }
}
