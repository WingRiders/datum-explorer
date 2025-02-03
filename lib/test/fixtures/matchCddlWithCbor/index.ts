import bigNumber from './bigNumber.json'
import genericArrayOfInts from './genericArrayOfInts.json'
import genericArrayOfTypes from './genericArrayOfTypes.json'
import genericMap from './genericMap.json'
import genericMap2 from './genericMap2.json'
import indigoCdp from './indigoCdp.json'
import indigoStabilityPool from './indigoStabilityPool.json'
import indigoStabilityPoolAccount from './indigoStabilityPoolAccount.json'
import lenfiPool from './lenfiPool.json'
import lenfiPoolConfig from './lenfiPoolConfig.json'
import minswapV2Order from './minswapV2Order.json'
import minswapV2Pool from './minswapV2Pool.json'
import sundaeV3Order from './sundaeV3Order.json'
import sundaeV3Pool from './sundaeV3Pool.json'
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
  genericArrayOfInts,
  genericArrayOfTypes,
  genericMap,
  genericMap2,
  indigoCdp,
  indigoStabilityPool,
  indigoStabilityPoolAccount,
  lenfiPool,
  lenfiPoolConfig,
  minswapV2Order,
  minswapV2Pool,
  wingridersLaunchpadNode,
  wingridersV2Pool,
  wingridersV2RequestAddStakingRewards,
  wingridersV2RequestRoutedSwap,
  sundaeV3Order,
  sundaeV3Pool,
]
