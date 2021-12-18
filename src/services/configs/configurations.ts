import { readFileSync } from 'fs'
import * as yaml from 'js-yaml'
import { join } from 'path'
import { Logger, LoggerTypes } from 'src/utils'

export default () => {
  const file: string = process.env.EXCHANGE_CONFIGFILE
  const path = join(__dirname, file)
  const data = readFileSync(path, 'utf8')

  Logger.trace(LoggerTypes.INIT, 'configuration.default()', { file: file, path: path, data: data })

  return yaml.load(data) as Record<string, any>
}
