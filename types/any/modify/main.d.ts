import type { Plugins } from '../../plugins/shape.js'
import type { PluginsInstanceMethods } from '../../plugins/instance.js'
import type { PluginsProperties } from '../../plugins/properties.js'
import type { ErrorProps } from '../../core_plugins/props/main.js'
import type { CustomAttributes } from '../../subclass/custom/main.js'
import type { OmitKeys } from '../../utils.js'
import type { AggregateErrors } from '../aggregate.js'

/**
 * Core `Error` properties which cannot be redefined by `plugin.properties()`,
 * `props`, instance methods or the `custom` option
 */
type CoreErrorProps = keyof Error | 'errors'

/**
 * Error instance object, used internally with additional generics.
 * This mixes: `Error`, aggregate errors, plugin instance methods,
 * `plugin.properties()` and `props`, while ensuring those do not overlap each
 * other.
 */
export type BaseError<
  PluginsArg extends Plugins,
  ErrorPropsArg extends ErrorProps,
  CustomAttributesArg extends CustomAttributes,
  AggregateErrorsArg extends AggregateErrors,
> = Error &
  AggregateErrorsArg &
  OmitKeys<CustomAttributesArg, CoreErrorProps> &
  OmitKeys<PluginsInstanceMethods<PluginsArg>, CoreErrorProps> &
  OmitKeys<
    PluginsProperties<PluginsArg>,
    CoreErrorProps | keyof PluginsInstanceMethods<PluginsArg>
  > &
  OmitKeys<
    ErrorPropsArg,
    | CoreErrorProps
    | keyof PluginsInstanceMethods<PluginsArg>
    | keyof PluginsProperties<PluginsArg>
  >

/**
 * Error instance object
 */
export type ErrorInstance<PluginsArg extends Plugins = []> = BaseError<
  PluginsArg,
  ErrorProps,
  CustomAttributes,
  AggregateErrors
>
