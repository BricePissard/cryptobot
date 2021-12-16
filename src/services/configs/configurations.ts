import { readFileSync } from 'fs'
import * as yaml from 'js-yaml'
import { join } from 'path'

export default () => {
  const file: string = process.env.CONFIGFILE
  const path = join(__dirname, file)
  console.log('## configuration.ts', path)
  const data = readFileSync(path, 'utf8')
  return yaml.load(data) as Record<string, any>
}
