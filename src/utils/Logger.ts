export const LoggerTypes = {
  WARN: 'WARN',
  DEFAULT: 'DEFAULT',
  INIT: 'INIT',
  CONTROLLER: 'CONTROLLER',
  API: 'API',
  GUARD: 'GUARD'
}
const traceColors = {
  [LoggerTypes.WARN]: { background: '#F00', text: '#000' },
  [LoggerTypes.DEFAULT]: { background: '#FFF', text: '#333' },
  [LoggerTypes.INIT]: { background: '#570', text: '#FFF' },
  [LoggerTypes.CONTROLLER]: { background: '#0EA', text: '#333' },
  [LoggerTypes.API]: { background: '#F60', text: '#333' },
  [LoggerTypes.GUARD]: { background: '#C09', text: '#FFF' }
}

export class Logger {
  /**
   * Write trace log for debug purpose.
   * @see chrome://inspect
   *
   * @param {LoggerTypes} type of the log to display
   * @param {string} classMethod string representation of the caller `Class.method()`
   * @param {any[]} optionalParams to send
   * @returns {void}
   */
  static trace(type, classMethod, optionalParams?) {
    if (process.env.NODE_ENV !== 'production') {
      const color = traceColors[type] || traceColors.DEFAULT
      console[type === LoggerTypes.WARN ? 'warn' : 'log'](
        `%c${classMethod}`,
        `background: ${color.background}; color: ${color.text}; margin: 0; padding: 1px 3px; border-radius: 3px`,
        optionalParams
      )
    }
  }
}
