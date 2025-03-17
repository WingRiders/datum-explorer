import bigNumber from './bigNumber.json'
import minswapV2Order from './minswapV2Order.json'
import minswapV2Pool from './minswapV2Pool.json'
import wingridersLaunchpadNode from './wingridersLaunchpadNode.json'
import wingridersV2Pool from './wingridersV2Pool.json'
import wingridersV2RequestAddStakingRewards from './wingridersV2RequestAddStakingRewards.json'
import wingridersV2RequestRoutedSwap from './wingridersV2RequestRoutedSwap.json'

type Fixture = {
  name: string
  cddlFileName: string
  cbor: string
  expectedParsed: object
}

export const fixtures: Fixture[] = [
  bigNumber,
  minswapV2Order,
  minswapV2Pool,
  wingridersLaunchpadNode,
  wingridersV2Pool,
  wingridersV2RequestAddStakingRewards,
  wingridersV2RequestRoutedSwap,
]
