/* eslint-disable no-magic-numbers */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { Kraken } from 'node-kraken-api'
import { BotConfigService } from '../../../services/configs/botconfigs.service'
import { ExchangeService } from '../../exchange.service'
import { SecretsService } from '../../../services/secrets/secrets.service'
import { 
  // Asset, 
  // Balance, 
  OrderType
} from '../../entities/exchange'
import { Logger, LoggerTypes } from 'src/utils'

  // @see https://www.kraken.com/u/security/api/new
const API_KEY = 'FXvnTEsd6dehOA1h1NSZQbhOp3OrA6FwE5nJ//5wR3Etp/4ZGVo9kjfT' 
const PRIVATE_KEY = '3nezwtQeMCmATsebXMU/18JdCXAvLnWUFW7cN4K71YVXsMySzCTw0BpHERnEYFFrafbfYLAM6mV/EAhhjE7eCA=='

/**
 * Notes about using binance testnet.
 * Binance testnet does not contain the same asset pairs.
 * as listed in the production version.
 * Please test that the asset pairs you'd like to trade exists.
 * Otherwise, auto rebalance on buy will not work.
 */
@Injectable()
export class KrakenExchange extends ExchangeService {
  private kraken: Kraken

  /**
   * @see https://github.com/jpcx/node-kraken-api#readme
   *
   * @param {httpService} httpService network access
   * @param {configs} configs to get the credentials
   * @param {secretService} secretService to get the secret api key
   */
  // eslint-disable-next-line no-unused-vars
  constructor(httpService: HttpService, private configs: BotConfigService, secretService: SecretsService) {
    super(httpService, secretService)
    
    const apiKeyName: string = this.configs.settings.api_keyname || API_KEY
    const secretKeyName: string = this.configs.settings.secret_keyname || PRIVATE_KEY

    this.kraken = new Kraken({
      key: apiKeyName,
      secret: secretKeyName,
      timeout: 5000
    })

    Logger.trace(LoggerTypes.SERVICE, 'KrakenExchange.constructor()', { settings: this.configs.settings, kraken: this.kraken })
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
    const assets = await this.kraken.assets()
    Logger.trace(LoggerTypes.SERVICE, 'KrakenExchange.getPrice()', { ofProduct: ofProduct, priceIn: priceIn, assets: assets })
    return assets
  }

  async getBalance(priceIn: string) {
    return true
  }

  async buy(
    asset: string,
    using: string,
    mode: OrderType = OrderType.Limit,
    amount = 1,
    price = 0.0001
  ): Promise<any> {
    const { txid } = await this.kraken.addOrder({
      pair:      `${asset}${using}`,
      type:      'buy',
      ordertype: mode,
      price:     `${price}`,
      volume:    `${amount}`,
    });

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
