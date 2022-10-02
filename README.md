<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/ehmicky/design/main/modern-errors/modern-errors_dark.svg"/>
  <img alt="modern-errors logo" src="https://raw.githubusercontent.com/ehmicky/design/main/modern-errors/modern-errors.svg" width="600"/>
</picture>

[![Codecov](https://img.shields.io/codecov/c/github/ehmicky/modern-errors.svg?label=tested&logo=codecov)](https://codecov.io/gh/ehmicky/modern-errors)
[![TypeScript](https://img.shields.io/badge/-typed-brightgreen?logo=typescript&colorA=gray&logoColor=0096ff)](/src/main.d.ts)
[![Node](https://img.shields.io/node/v/modern-errors.svg?logo=node.js&logoColor=66cc33)](https://www.npmjs.com/package/modern-errors)
[![Twitter](https://img.shields.io/badge/%E2%80%8B-twitter-brightgreen.svg?logo=twitter)](https://twitter.com/intent/follow?screen_name=ehmicky)
[![Medium](https://img.shields.io/badge/%E2%80%8B-medium-brightgreen.svg?logo=medium)](https://medium.com/@ehmicky)

Handle errors like it's 2022 🔮

Error handling framework that is pluggable, minimalist yet featureful.

# Features

Core features:

- Create [custom error classes](#create-custom-error-classes)
- Wrap inner errors' [message](#wrap-error-message) or [class](#set-error-class)
- Set properties on [individual errors](#error-instance-properties) or on
  [all errors of the same class](#error-class-properties)
- Separate known and [unknown errors](#unknown-errors)
- Handle [invalid errors](#invalid-errors) (not an `Error` instance, missing
  stack, etc.)
- Based on standard JavaScript: [`throw`](#throw-errors),
  [`try/catch`](#re-throw-errors), [`new Error()`](#throw-errors),
  [`error.cause`](#re-throw-errors), [`instanceof`](#check-error-class),
  [`class`](#custom-logic), [`toJSON()`](#serialize)
- [Custom logic](#custom-logic)

[Plugins](#plugins) are also available:

- Handle errors in [CLI](#cli-errors) modules
- Indicate where to [report bugs](#bug-reports)
- [Serialize](#serialize)/[parse](#parse) errors
- Create your own plugin

# Example

Create custom error classes.

```js
// `errors.js`
import modernErrors from 'modern-errors'

// Base error class
export const AnyError = modernErrors()

export const UnknownError = AnyError.subclass('UnknownError')
export const InputError = AnyError.subclass('InputError')
export const AuthError = AnyError.subclass('AuthError')
export const DatabaseError = AnyError.subclass('DatabaseError')
```

Throw/re-throw errors.

```js
import { InputError } from './errors.js'

const readContents = async function (filePath) {
  try {
    return await readFile(filePath)
  } catch (cause) {
    throw new InputError(`Could not read ${filePath}`, { cause })
  }
}
```

Wrap the main functions to normalize any errors.

```js
import { AnyError } from './errors.js'

export const main = async function (filePath) {
  try {
    return await readContents(filePath)
  } catch (error) {
    throw AnyError.normalize(error)
  }
}
```

# Install

```bash
npm install modern-errors
```

If any [plugin](#plugins) is used, it must also be installed.

```bash
npm install modern-errors-{pluginName}
```

This package is an ES module and must be loaded using
[an `import` or `import()` statement](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c),
not `require()`.

# API

## modernErrors(plugins?, options?)

`plugins`: [`Plugin[]?`](#plugins)\
`options`: [`Options?`](#plugin-options-1)

Creates and returns [`AnyError`](#anyerror).

## AnyError

Base error class.

### AnyError.subclass(name, options?)

`name`: `string`\
`options`: [`Options?`](#options)\
_Return value_: `class extends AnyError {}`

Creates and returns an error subclass. The first one must be named
[`UnknownError`](#unknown-errors).

Subclasses can [also call](#shared-custom-logic) `ErrorClass.subclass()`
themselves.

### AnyError.normalize(anyException)

_Type_: `(anyException) => AnyError`

Normalizes [invalid errors](#invalid-errors) and assigns the `UnknownError`
class to [_unknown_ errors](#unknown-errors). This should
[wrap each main function](#top-level-error-handler).

## Options

### props

_Type_: `object`

[Error properties](#error-properties).

### custom

_Type_: `class extends AnyError {}`

[Custom class](#custom-logic) to add any methods, `constructor` or properties.
It must `extend` from [`AnyError`](#anyerror).

### Plugin options

Any [plugin options](#plugin-options-1) can also be specified.

# Usage

## Setup

### Create custom error classes

```js
// Base error class
export const AnyError = modernErrors()

// The first error class must be named "UnknownError"
export const UnknownError = AnyError.subclass('UnknownError')
export const InputError = AnyError.subclass('InputError')
export const AuthError = AnyError.subclass('AuthError')
export const DatabaseError = AnyError.subclass('DatabaseError')
```

### Top-level error handler

Each main function should be wrapped with
[`AnyError.normalize()`](#anyerrornormalizeanyexception).

```js
import { AnyError } from './errors.js'

export const main = async function (filePath) {
  try {
    return await readContents(filePath)
  } catch (error) {
    throw AnyError.normalize(error)
  }
}
```

## Throw errors

### Simple errors

```js
import { InputError } from './errors.js'

const validateFilePath = function (filePath) {
  if (filePath === '') {
    throw new InputError('Missing file path.')
  }
}
```

### Re-throw errors

Errors are re-thrown using the
[standard `cause` parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause).
This allows wrapping the error [message](#wrap-error-message),
[class](#set-error-class), or [options](#modify-options).

```js
import { InputError } from './errors.js'

const readContents = async function (filePath) {
  try {
    return await readFile(filePath)
  } catch (cause) {
    throw new InputError(`Could not read ${filePath}`, { cause })
  }
}
```

Inner errors are [merged](https://github.com/ehmicky/merge-error-cause) to outer
errors, including their
[`message`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message),
[`stack`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack),
[`name`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name),
[`AggregateError.errors`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)
and any [additional property](#error-properties). This ensures:

- `error.cause` does not need to be
  [traversed](https://github.com/ehmicky/merge-error-cause#traversing-errorcause)
- The stack trace is neither
  [verbose nor redundant](https://github.com/ehmicky/merge-error-cause#verbose-stack-trace),
  while still keeping all information

### Invalid errors

Some exceptions might not be
[`Error` instances](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
or might have
[invalid properties](https://github.com/ehmicky/normalize-exception#features).

<!-- eslint-disable no-throw-literal -->

```js
try {
  throw 'Missing file path.'
} catch (error) {
  console.log(error.message.trim()) // Error: `error.message` is `undefined`
  throw error
}
```

[`AnyError.normalize()`](#anyerrornormalizeanyexception) converts them to valid
`Error` instances.

<!-- eslint-disable no-throw-literal -->

```js
import { AnyError } from './errors.js'

try {
  throw 'Missing file path.'
} catch (error) {
  const normalizedError = AnyError.normalize(error)
  console.log(normalizedError) // UnknownError: Missing file path.
  console.log(normalizedError.message.trim()) // 'Missing file path.'
  throw normalizedError
}
```

Any exception can also be safely used as `error.cause` without using
`AnyError.normalize()`.

<!-- eslint-disable no-throw-literal -->

```js
try {
  throw 'Missing file path.'
} catch (cause) {
  throw new InputError('Could not read the file.', { cause })
  // InputError: Missing file path.
  // Could not read the file.
}
```

### Wrap error message

The outer error message is appended.

```js
try {
  await readFile(filePath)
} catch (cause) {
  throw new InputError(`Could not read ${filePath}`, { cause })
  // InputError: File does not exist.
  // Could not read /example/path
}
```

If the outer error message ends with `:`, it is prepended instead.

```js
throw new InputError(`Could not read ${filePath}:`, { cause })
// InputError: Could not read /example/path: File does not exist.
```

`:` can optionally be followed a newline.

```js
throw new InputError(`Could not read ${filePath}:\n`, { cause })
// InputError: Could not read /example/path:
// File does not exist.
```

Empty messages can be used to wrap an error without changing its message.

```js
throw new InputError('', { cause })
// InputError: File does not exist.
```

### Aggregate errors

The `errors` option can be used to aggregate multiple errors into one. This is
like
[`new AggregateError(errors)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError/AggregateError)
except that it works with any error class.

```js
const inputError = new InputError('Could not read file.')
const authError = new AuthError('Invalid username.')
const aggregateError = new InputError('Wrong file.', {
  errors: [inputError, authError],
})

console.log(aggregateError)
// InputError: Wrong file.
//     at ...
//   [errors]: [
//     InputError: Could not read file.
//         at ...
//     AuthError: Invalid username.
//         at ...
//   ]
// }
console.log(aggregateError.errors)
// [inputError, authError]
```

## Error properties

### Error instance properties

```js
const error = new InputError('Could not read the file.', {
  props: { isUserError: true },
})
console.log(error.isUserError) // true
```

### Error class properties

```js
const InputError = AnyError.subclass('InputError', {
  props: { isUserError: true },
})
const error = new InputError('Could not read the file.')
console.log(error.isUserError) // true
```

## Error class

### Check error class

Error classes (including [`AnyError`](#anyerror) and
[`UnknownError`](#unknown-errors)) should be exported so they can be checked. It
also enables re-using them across multiple modules.

<!-- eslint-disable max-depth -->

```js
import {
  exampleModule,
  InputError,
  UnknownError,
  AnyError,
} from 'example-module'

try {
  exampleModule()
} catch (error) {
  // Known `InputError`
  if (error instanceof InputError) {
    // ...
  }

  // Unknown error (from that specific library)
  if (error instanceof UnknownError) {
    // ...
  }

  // Any known or unknown error (from that specific library)
  if (error instanceof AnyError) {
    // ...
  }
}
```

### Set error class

When [re-throwing errors](#re-throw-errors), the outer error class replaces the
inner one's.

```js
try {
  throw new AuthError('Could not authenticate.')
} catch (cause) {
  throw new InputError('Could not read the file.', { cause })
  // Now an InputError
}
```

The inner error's class can be kept by using [`AnyError`](#anyerror) instead.

```js
try {
  throw new AuthError('Could not authenticate.')
} catch (cause) {
  throw new AnyError('Could not read the file.', { cause })
  // Still an AuthError
}
```

### Unknown errors

Each main function should be wrapped with
[`AnyError.normalize()`](#anyerrornormalizeanyexception).

```js
import { AnyError } from './errors.js'

export const main = async function (filePath) {
  try {
    console.log(filePath.trim())
    return await readContents(filePath)
  } catch (error) {
    throw AnyError.normalize(error)
  }
}
```

This assigns the `UnknownError` class to any error without a _known_ class: the
ones created by [`AnyError.subclass()`](#anyerrorsubclassname-options). Those
indicate unexpected exceptions and bugs.

<!-- eslint-disable unicorn/no-null -->

```js
main(null) // UnknownError: Cannot read properties of null (reading 'trim')
```

_Unknown_ errors should be handled in a `try {} catch {}` block and
[wrapped](#set-error-class) with a _known_ class instead. That block should only
cover the statement that might throw in order to prevent catching other
unrelated _unknown_ errors.

```js
try {
  console.log(filePath.trim())
} catch (cause) {
  throw new InputError('Invalid file path:', { cause })
}
```

<!-- eslint-disable unicorn/no-null, max-len -->

```js
main(null) // InputError: Invalid file path: Cannot read properties of null (reading 'trim')
```

## Custom logic

### Class custom logic

The [`custom`](#custom) option can be used to provide an error `class` with
additional methods, `constructor` or properties.

<!-- eslint-disable no-param-reassign, fp/no-mutation, fp/no-this -->

```js
export const InputError = AnyError.subclass('InputError', {
  // The `class` must extend from `AnyError`
  custom: class extends AnyError {
    // If a `constructor` is defined, its parameters must be (message, options)
    // like `AnyError`
    constructor(message, options) {
      // Modifying `message` or `options` should be done before `super()`
      message += message.endsWith('.') ? '' : '.'

      // All arguments should be forwarded to `super()`, including any
      // custom `options` or additional `constructor` parameters
      super(message, options)

      // `name` is automatically added, so this is not necessary
      // this.name = 'InputError'
    }

    isUserInput() {
      return this.message.includes('user')
    }
  },
})

const error = new InputError('Wrong user name')
console.log(error.message) // 'Wrong user name.'
console.log(error.isUserInput()) // true
```

### Shared custom logic

[`ErrorClass.subclass()`](#anyerrorsubclassname-options) can be used to share
logic between error classes.

<!-- eslint-disable fp/no-this -->

```js
const SharedError = AnyError.subclass('SharedError', {
  custom: class extends AnyError {
    isUserInput() {
      return this.message.includes('user')
    }
  },
})

export const InputError = SharedError.subclass('InputError')
export const AuthError = SharedError.subclass('AuthError', {
  custom: class extends SharedError {
    isAuth() {
      return this.message.includes('auth')
    }
  },
})
```

# Plugins

## Adding plugins

Plugins extend `modern-errors` features. They must first be installed.

```bash
npm install modern-errors-{pluginName}
```

They are then passed as a first argument to
[`modernErrors()`](#modernerrorsplugins-options).

<!-- eslint-disable import/order -->

```js
import modernErrors from 'modern-errors'

import modernErrorsBugs from 'modern-errors-bugs'
import modernErrorsProps from 'modern-errors-props'

export const AnyError = modernErrors([modernErrorsProps, modernErrorsBugs])
```

## Plugin options

### Configure options

Most plugins can be configured with options. The option's name is the same as
the plugin.

```js
const options = {
  // `modern-error-bugs` options
  bugs: 'https://github.com/my-name/my-project/issues',
  // `props` can be configured and modified like plugin options
  props: { userId: 5 },
}
```

Those can apply to:

- Any error: second argument to [`modernErrors()`](#modernerrorsplugins-options)

```js
export const AnyError = modernErrors(plugins, options)
```

- Any error of a specific class: second argument to
  [`AnyError.subclass()`](#anyerrorsubclassname-options)

```js
export const InputError = AnyError.subclass('InputError', options)
```

- Any error of multiple classes: using `ErrorClass.subclass()`

```js
export const SharedError = AnyError.subclass('SharedError', options)

export const InputError = SharedError.subclass('InputError')
export const AuthError = SharedError.subclass('AuthError')
```

- A specific error: second argument to the error's constructor

```js
throw new InputError('Could not read the file.', options)
```

- A plugin method call: last argument, passing only that plugin's options

```js
AnyError[methodName](...args, options[pluginName])
```

```js
error[methodName](...args, options[pluginName])
```

### Modify options

When [re-throwing errors](#re-throw-errors), the outer error's options replace
the inner ones.

```js
try {
  throw new AuthError('Could not authenticate.', innerOptions)
} catch (cause) {
  // Options are now `outerOptions`. `innerOptions` are ignored.
  throw new InputError('Could not read file.', { cause, ...outerOptions })
}
```

The inner error's options can be kept by using [`AnyError`](#anyerror) instead.

```js
try {
  throw new AuthError('Could not authenticate.', innerOptions)
} catch (cause) {
  // `outerOptions` are merged with `innerOptions`
  throw new AnyError('Could not read file.', { cause, ...outerOptions })
}
```

## Plugin methods

Plugins can set:

- Error properties: `error.message`, `error.stack` or any other `error.*`
- Error instance methods: `error.exampleMethod()`
- [`AnyError`](#anyerror) static methods: `AnyError.exampleMethod()`

Error instance methods are only available on [_known_ errors](#unknown-errors).
This can be ensured using `AnyError.normalize()`.

```js
try {
  // ...
} catch (error) {
  // This throws if `error` has an unknown class
  error.exampleMethod()

  // This is safe
  AnyError.normalize(error).exampleMethod()
}
```

## List of plugins

- [`modern-errors-cli`](#cli-errors): Handle errors from CLI modules
- [`modern-errors-bugs`](#bug-reports): Print where to report bugs
- [`modern-errors-serialize`](#serializationparsing): Serialize/parse errors

### CLI errors

_Plugin_: [`modern-errors-cli`](https://github.com/ehmicky/modern-errors-cli)

#### CLI error handler

`error.exit()` prints `error` on the console then exits the process.

```js
import { AnyError } from './errors.js'

const cliMain = function () {
  try {
    // ...
  } catch (error) {
    AnyError.normalize(error).exit()
  }
}

cliMain()
```

### Bug reports

_Plugin_: [`modern-errors-bugs`](https://github.com/ehmicky/modern-errors-bugs)

The `bugs` option includes a bug reports URL in error messages. Although any
error class can use it, it is especially useful with
[`UnknownError`](#unknown-errors).

```js
export const UnknownError = AnyError.subclass('UnknownError', {
  bugs: 'https://github.com/my-name/my-project/issues',
})

// UnknownError: Cannot read properties of null (reading 'trim')
// Please report this bug at: https://github.com/my-name/my-project/issues
```

### Serialization/parsing

_Plugin_:
[`modern-errors-serialize`](https://github.com/ehmicky/modern-errors-serialize)

#### Serialize

`error.toJSON()` converts errors to plain objects that are
[serializable](https://github.com/ehmicky/error-serializer#json-safety) to JSON
([or YAML](https://github.com/ehmicky/error-serializer#custom-serializationparsing),
etc.). It is
[automatically called](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior)
by `JSON.stringify()`. All error properties
[are kept](https://github.com/ehmicky/error-serializer#additional-error-properties).

```js
const error = new InputError('Wrong file.', { props: { filePath } })
const errorObject = error.toJSON()
// { name: 'InputError', message: 'Wrong file', stack: '...', filePath: '...' }
const errorString = JSON.stringify(error)
// '{"name":"InputError",...}'
```

#### Parse

`AnyError.parse(errorObject)` converts those error plain objects back to
identical error instances. The original error class is preserved providing it is
a [_known_ class](#unknown-errors).

```js
const newErrorObject = JSON.parse(errorString)
const newError = AnyError.parse(newErrorObject)
// InputError: Wrong file.
//     at ...
//   filePath: '...'
```

#### Deep serialization/parsing

Objects and arrays are deeply serialized and parsed.

```js
const error = new InputError('Wrong file.')
const deepArray = [{}, { error }]

const jsonString = JSON.stringify(deepArray)
const newDeepArray = JSON.parse(jsonString)

const newError = AnyError.parse(newDeepArray)[1].error
// InputError: Wrong file.
//     at ...
```

# Modules

This framework brings together a collection of modules which can also be used
individually:

- [`error-custom-class`](https://github.com/ehmicky/error-custom-class): Create
  one error class
- [`error-class-utils`](https://github.com/ehmicky/error-class-utils): Utilities
  to properly create error classes
- [`error-serializer`](https://github.com/ehmicky/error-serializer): Convert
  errors to/from plain objects
- [`normalize-exception`](https://github.com/ehmicky/normalize-exception):
  Normalize exceptions/errors
- [`merge-error-cause`](https://github.com/ehmicky/merge-error-cause): Merge an
  error with its `cause`
- [`set-error-class`](https://github.com/ehmicky/set-error-class): Properly
  update an error's class
- [`set-error-message`](https://github.com/ehmicky/set-error-message): Properly
  update an error's message
- [`set-error-props`](https://github.com/ehmicky/set-error-props): Properly
  update an error's properties
- [`handle-cli-error`](https://github.com/ehmicky/handle-cli-error): 💣 Error
  handler for CLI applications 💥

# Related projects

- [`error-cause-polyfill`](https://github.com/ehmicky/error-cause-polyfill):
  Polyfill `error.cause`
- [`log-process-errors`](https://github.com/ehmicky/log-process-errors): Show
  some ❤ to Node.js process errors

# Support

For any question, _don't hesitate_ to [submit an issue on GitHub](../../issues).

Everyone is welcome regardless of personal background. We enforce a
[Code of conduct](CODE_OF_CONDUCT.md) in order to promote a positive and
inclusive environment.

# Contributing

This project was made with ❤️. The simplest way to give back is by starring and
sharing it online.

If the documentation is unclear or has a typo, please click on the page's `Edit`
button (pencil icon) and suggest a correction.

If you would like to help us fix a bug or add a new feature, please check our
[guidelines](CONTRIBUTING.md). Pull requests are welcome!

<!-- Thanks go to our wonderful contributors: -->

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- prettier-ignore -->
<!--
<table><tr><td align="center"><a href="https://twitter.com/ehmicky"><img src="https://avatars2.githubusercontent.com/u/8136211?v=4" width="100px;" alt="ehmicky"/><br /><sub><b>ehmicky</b></sub></a><br /><a href="https://github.com/ehmicky/modern-errors/commits?author=ehmicky" title="Code">💻</a> <a href="#design-ehmicky" title="Design">🎨</a> <a href="#ideas-ehmicky" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ehmicky/modern-errors/commits?author=ehmicky" title="Documentation">📖</a></td></tr></table>
 -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
