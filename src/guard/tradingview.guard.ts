/* eslint-disable prettier/prettier */
import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Logger, LoggerTypes } from 'src/utils'

@Injectable()
export class TradingViewGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  checkAllowedAddress(ipAddress: string): boolean {
    Logger.trace(LoggerTypes.GUARD, 'TradingViewGuard.checkAllowedAddress()', { ipAddress: ipAddress })
    if (process.env.NODE_ENV === 'dev') {
      return true
    }
    const allowedAddress = [undefined, 'localhost', '127.0.0.1', '52.89.214.238', '34.212.75.30', '54.218.53.128', '52.32.178.7']
    if (allowedAddress.find(val => val === ipAddress) === undefined) {
      console.error(`Received a request from suspicious address: ${ipAddress}`)
      return false
    }
    return true
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp().getRequest<Request>()
    const forwardedIp: string = ctx.headers['x-forwarded-for']
    Logger.trace(LoggerTypes.GUARD, 'TradingViewGuard.canActivate()', { context: context, forwardedIp: forwardedIp })
    return this.checkAllowedAddress(forwardedIp)
  }
}
