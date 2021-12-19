import { readFileSync } from 'fs'
import * as yaml from 'js-yaml'
import { join } from 'path'
import { Logger, LoggerTypes } from 'src/utils'

export default () => {
  const exchangeName: string = String(process.env.EXCHANGE_NAME || '').toUpperCase()
  const file: string = process.env[`EXCHANGE_${exchangeName}_CONFIGFILE`]
  const path = join(__dirname, file)
  const data = readFileSync(path, 'utf8')

  Logger.trace(LoggerTypes.INIT, 'configuration.default()', { file, path, data })

  return yaml.load(data) as Record<string, any>
}
