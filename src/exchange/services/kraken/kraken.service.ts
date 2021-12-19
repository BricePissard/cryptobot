/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-magic-numbers */
import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { BotConfigService } from '../../../services/configs/botconfigs.service'
import { ExchangeService } from '../../exchange.service'
import { SecretsService } from '../../../services/secrets/secrets.service'
import {
  // Asset,
  // Balance,
  OrderType
} from '../../entities/exchange'
import { Logger, LoggerTypes } from 'src/utils'
const ccxt = require('ccxt')

/**
 * @see https://docs.ccxt.com/en/latest/manual.html#unified-api
 */
@Injectable()
export class KrakenExchange extends ExchangeService {
  private kraken: any

  /**
   * @param {httpService} httpService network access
   * @param {configs} configs to get the credentials
   * @param {secretService} secretService to get the secret api key
   */
  constructor(
    public httpService: HttpService,
    private configs: BotConfigService,
    public secretService: SecretsService
  ) {
    super(httpService, secretService)

    const api_keyname: string = this.configs.settings.api_keyname
    const secret_keyname: string = this.configs.settings.secret_keyname

    const apiKeyName: string = process.env[api_keyname]
    const secretKeyName: string = process.env[secret_keyname]

    // this.kraken = new ccxt.kraken({
    //   apiKey: apiKeyName,
    //   secret: secretKeyName,
    //   timeout: 5000
    // })

    Logger.trace(LoggerTypes.SERVICE, 'KrakenExchange.constructor()', {
      settings: this.configs.settings,
      configs,
      secretKeyName,
      apiKeyName
    })
  }

  getLotSize(ofProduct: string, priceIn: string) {
    Logger.trace(LoggerTypes.SERVICE, 'KrakenExchange.getLotSize()', { ofProduct: ofProduct, priceIn: priceIn })
    return true
  }

  getTime() {
    Logger.trace(LoggerTypes.SERVICE, 'KrakenExchange.getTime()')
  }

  /**
   * Get cryptocurrency value according to a specific FIA currency value.
   *
   * @param {string} ofProduct Crypto currency code, Ex 'BTC'
   * @param {string} priceIn FIA currency code, Ex: 'EUR'
   * @returns {Promise<any>}
   */
  async getPrice(ofProduct: string, priceIn: string): Promise<any> {
    // const assets = await this.kraken.assets()
    // const timer = await this.kraken.time()
    // const ticker = await this.kraken.ticker({ pair: `${ofProduct}${priceIn}` })
    const balance = this.kraken.fetch_balance()
    balance.then((el) => Logger.trace(LoggerTypes.SERVICE, 'KrakenExchange.getPrice().then()', el))

    Logger.trace(LoggerTypes.SERVICE, 'KrakenExchange.getPrice()', {
      ofProduct,
      priceIn,
      balance
    })

    return balance
  }

  async getBalance(priceIn: string) {
    Logger.trace(LoggerTypes.SERVICE, 'KrakenExchange.getBalance()', { priceIn })
    return true
  }

  async buy(asset: string, using: string, mode: OrderType = OrderType.Limit, amount = 1, price = 0.0001): Promise<any> {
    const { txid } = await this.kraken.addOrder({
      pair: `${asset}${using}`,
      type: 'buy',
      ordertype: mode,
      price: `${price}`,
      volume: `${amount}`
    })

    return txid
  }

  async sell(asset: string, sellFor: string, amount?: number): Promise<any> {
    return true
  }

  /**
   * @TODO: implement
   */
  clear: undefined

  /**
   * @TODO: implement
   */
  bidDips: undefined
}
