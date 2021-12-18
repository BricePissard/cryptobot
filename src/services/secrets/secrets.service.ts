import { Injectable } from '@nestjs/common'
import { Logger, LoggerTypes } from 'src/utils'

@Injectable()
export class SecretsService {
  async getSecret(secret: string, version = 'latest'): Promise<string> {
    Logger.trace(LoggerTypes.SERVICE, 'SecretsService.getSecret()', { secret: secret, version: version })
    return ''
  }
}
