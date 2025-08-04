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
import minswapV1Order from './minswapV1Order.json'
import minswapV1Pool from './minswapV1Pool.json'
import minswapV2Order from './minswapV2Order.json'
import minswapV2Pool from './minswapV2Pool.json'
import splashBasicPoolDatum from './splashBasicPoolDatum.json'
import splashDepositDatum from './splashDepositDatum.json'
import splashLimitOrderDatum from './splashLimitOrderDatum.json'
import splashRoyaltyPoolDatum from './splashRoyaltyPoolDatum.json'
import splashTreasuryPoolDatum from './splashTreasuryPoolDatum.json'
import sundaeV3OrderDatum from './sundaeV3OrderDatum.json'
import sundaeV3PoolDatum from './sundaeV3PoolDatum.json'
import sundaeV3PoolRedeemer from './sundaeV3PoolRedeemer.json'
import vyfiOrder from './vyfiOrder.json'
import vyfiPool from './vyfiPool.json'
import wingridersLaunchpadNode from './wingridersLaunchpadNode.json'
import wingridersV2EvolvePool from './wingridersV2EvolvePool.json'
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
  minswapV1Order,
  minswapV1Pool,
  minswapV2Order,
  minswapV2Pool,
  vyfiOrder,
  vyfiPool,
  wingridersLaunchpadNode,
  wingridersV2EvolvePool,
  wingridersV2Pool,
  wingridersV2RequestAddStakingRewards,
  wingridersV2RequestRoutedSwap,
  sundaeV3OrderDatum,
  sundaeV3PoolDatum,
  sundaeV3PoolRedeemer,
  splashBasicPoolDatum,
  splashTreasuryPoolDatum,
  splashRoyaltyPoolDatum,
  splashLimitOrderDatum,
  splashDepositDatum, // https://cardanoscan.io/transaction/947503468c6ae77f8b917c079c2b1fda18efec50dc50c1df57a0d473f6d4bb5a?tab=utxo
]
