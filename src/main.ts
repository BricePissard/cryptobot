/* eslint-disable @typescript-eslint/no-var-requires */
import { NestFactory } from '@nestjs/core'

import { BitFlyer } from './bitflyer.module'
import { Binance } from './binance.module'
import { Kraken } from './kraken.module'

import { TradingViewGuard } from './guard/tradingview.guard'
import 'source-map-support/register'
require('dotenv').config()

const GUARDS = ['tradingview', 'none'].map((guard) => guard.toLowerCase())
const EXCHANGES = ['bitflyer', 'binance', 'kraken']
const GUARD_ERROR = `Authorization guard not specified. Set GUARD env variable to one of: ${GUARDS.toString()}`
const EXCHANGE_ERROR = `Exchange not specified. Set EXCHANGE env variable to one of: ${EXCHANGES.toString()}`

/**
 * Start Application
 */
async function bootstrap() {
  let module: any
  switch (process.env.EXCHANGE.toLowerCase()) {
    case 'bitflyer':
      module = BitFlyer
      break
    case 'binance':
      module = Binance
      break
    case 'kraken':
      module = Kraken
      break
    default:
      throw new Error(EXCHANGE_ERROR)
  }

  const app = await NestFactory.create(module, {
    logger: ['error', 'warn']
  })

  switch (process.env.GUARD.toLowerCase()) {
    case 'tradingview':
      app.useGlobalGuards(new TradingViewGuard())
      break
    case 'none':
      break
    default:
      throw new Error(GUARD_ERROR)
  }
  await app.listen(process.env.PORT)
  console.log('Bot is running')
  console.log(`
  exchange:${process.env.EXCHANGE}
  guards: ${process.env.GUARD}
  `)
}
bootstrap()
