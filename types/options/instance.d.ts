import type { Plugins } from '../plugins/shape.js'
import type { AggregateErrors } from '../any/aggregate.js'
import type { PluginsOptions } from './plugins.js'

/**
 * Options passed to error constructors, excluding any plugin options
 */
export type MainInstanceOptions = AggregateErrors & {
  /**
   * Any error's message, class and options can be wrapped using the
   * [standard `cause` option](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause).
   *
   * Instead of being set as a `cause` property, the inner error is directly
   * [merged](https://github.com/ehmicky/merge-error-cause) to the outer error,
   * including its
   * [`message`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message),
   * [`stack`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack),
   * [`name`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name),
   * [`AggregateError.errors`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)
   * and any [additional property](#error-instance-properties).
   *
   * @example
   * ```js
   * try {
   *   // ...
   * } catch (cause) {
   *   throw new InputError('Could not read the file.', { cause })
   * }
   * ```
   */
  readonly cause?: unknown
}

/**
 * Options passed to error constructors, used internally only with additional
 * generics
 */
export type SpecificInstanceOptions<PluginsArg extends Plugins> =
  MainInstanceOptions & PluginsOptions<PluginsArg>

/**
 * Options passed to error constructors: `new ErrorClass('message', options)`
 */
export type InstanceOptions<PluginsArg extends Plugins = []> =
  SpecificInstanceOptions<PluginsArg>
