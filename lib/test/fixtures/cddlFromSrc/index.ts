import wingridersLaunchpadNode from './wingridersLaunchpadNode.json'
import wingridersV2Request from './wingridersV2Request.json'

type Fixture = {
  name: string
  cddlFileName: string
  expectedAst: object
}

export const fixtures: Fixture[] = [wingridersLaunchpadNode, wingridersV2Request]
