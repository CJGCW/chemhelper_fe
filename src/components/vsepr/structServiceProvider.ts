import { StandaloneStructServiceProvider } from 'ketcher-standalone'

let instance: StandaloneStructServiceProvider | null = null

export function getStructServiceProvider(): StandaloneStructServiceProvider {
  if (!instance) instance = new StandaloneStructServiceProvider()
  return instance
}
