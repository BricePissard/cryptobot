import { AssertionError } from 'assert'

/**
 * Assert if the submit value is a `string`
 * @param {any} val to test
 */
export function assertIsString(val: any): asserts val is string {
  if (typeof val !== 'string') {
    throw new AssertionError({ message: 'Not a string!' })
  }
}

/**
 * Assert if the submit value is an `array` and is empty
 * @param {any[]} val to test
 */
export function assertIsEmpty(val: any[]): asserts val is any[] {
  const ONE = 1
  if (val.length < ONE) {
    throw new AssertionError({ message: 'Empty array!' })
  }
}

/**
 * Assert if the submit value is a decimal number.
 * @param {number} num Number to test
 * @returns {boolean}
 */
export function decimalPlaces(num: number) {
  const isInt = (n: number) => {
    return n === Math.round(n) && !isNaN(n)
  }

  const a = Math.abs(num)
  const TEN = 10
  const ONE = 1
  let c = a,
    count = 1
  while (!isInt(c) && isFinite(c)) {
    c = a * Math.pow(TEN, count++)
  }
  return count - ONE
}
