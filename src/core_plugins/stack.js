// eslint-disable-next-line filenames/match-exported
import cleanStack from 'clean-stack'

// Clean `error.stack`
const properties = function ({ error }) {
  // eslint-disable-next-line n/prefer-global/process
  if (globalThis.process === undefined) {
    return {}
  }

  // eslint-disable-next-line n/prefer-global/process
  const basePath = globalThis.process.cwd()
  const stack = cleanStack(error.stack, { pretty: true, basePath })
  return { stack }
}

const STACK_PLUGIN = { name: 'stack', properties }

// eslint-disable-next-line import/no-default-export
export default STACK_PLUGIN
