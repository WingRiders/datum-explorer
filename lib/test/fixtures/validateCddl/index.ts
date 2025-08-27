type Fixture = {
  name: string
  cddlFileName: string
  expectedErrorMessage?: string
}

export const fixtures: Fixture[] = [
  {name: 'int', cddlFileName: 'int.cddl'},
  {name: 'cswapOrderDatum', cddlFileName: 'cswapOrderDatum.cddl'},
  {name: 'cswapPoolDatum', cddlFileName: 'cswapPoolDatum.cddl'},
  {name: 'genericArrayOfInts', cddlFileName: 'genericArrayOfInts.cddl'},
  {name: 'genericArrayOfTypes', cddlFileName: 'genericArrayOfTypes.cddl'},
  {name: 'genericMap', cddlFileName: 'genericMap.cddl'},
  {name: 'genericMap2', cddlFileName: 'genericMap2.cddl'},
  {name: 'indigoCdp', cddlFileName: 'indigoCdp.cddl'},
  {name: 'indigoStabilityPool', cddlFileName: 'indigoStabilityPool.cddl'},
  {name: 'lenfiPool', cddlFileName: 'lenfiPool.cddl'},
  {name: 'lenfiPoolConfig', cddlFileName: 'lenfiPoolConfig.cddl'},
  {name: 'minswapV1Order', cddlFileName: 'minswapV1Order.cddl'},
  {name: 'minswapV1Pool', cddlFileName: 'minswapV1Pool.cddl'},
  {name: 'minswapV2Order', cddlFileName: 'minswapV2Order.cddl'},
  {name: 'minswapV2Pool', cddlFileName: 'minswapV2Pool.cddl'},
  {name: 'splashBasicPoolDatum', cddlFileName: 'splashBasicPoolDatum.cddl'},
  {name: 'splashTreasuryPoolDatum', cddlFileName: 'splashTreasuryPoolDatum.cddl'},
  {name: 'splashRoyaltyPoolDatum', cddlFileName: 'splashRoyaltyPoolDatum.cddl'},
  {name: 'splashLimitOrderDatum', cddlFileName: 'splashLimitOrderDatum.cddl'},
  {name: 'splashDepositDatum', cddlFileName: 'splashDepositDatum.cddl'},
  {name: 'sundaeV3OrderDatum', cddlFileName: 'sundaeV3OrderDatum.cddl'},
  {name: 'sundaeV3PoolDatum', cddlFileName: 'sundaeV3PoolDatum.cddl'},
  {name: 'sundaeV3PoolRedeemer', cddlFileName: 'sundaeV3PoolRedeemer.cddl'},
  {name: 'vyfiOrder', cddlFileName: 'vyfiOrder.cddl'},
  {name: 'vyfiPool', cddlFileName: 'vyfiPool.cddl'},
  {name: 'wingridersLaunchpadNode', cddlFileName: 'wingridersLaunchpadNode.cddl'},
  {name: 'wingridersV2Pool', cddlFileName: 'wingridersV2Pool.cddl'},
  {name: 'wingridersV2Request', cddlFileName: 'wingridersV2Request.cddl'},
  {
    name: 'invalid - no rule',
    cddlFileName: 'invalid/noRule.cddl',
    expectedErrorMessage:
      'CDDL parsing error\n  [{"position":{"line":1,"column":1,"range":[0,0],"index":0},"msg":{"short":"you must have at least one rule defined"}}]',
  },
  {
    name: 'invalid - missing equal sign',
    cddlFileName: 'invalid/missingEqualSign.cddl',
    expectedErrorMessage:
      'CDDL parsing error\n  [{"position":{"line":1,"column":1,"range":[0,5],"index":0},"msg":{"short":"expected assignment token \'=\', \'/=\' or \'//=\' after rule identifier"}}]',
  },
  {
    name: 'invalid - missing definition',
    cddlFileName: 'invalid/missingDefinition.cddl',
    expectedErrorMessage:
      'CDDL parsing error\n  [{"position":{"line":1,"column":0,"range":[8,13],"index":8},"msg":{"short":"missing definition for rule TypeB"}}]',
  },
  {
    name: 'invalid - time',
    cddlFileName: 'invalid/time.cddl',
    expectedErrorMessage: 'Rule TypeA refers to undefined type time.',
  },
  {
    name: 'invalid - generic params',
    cddlFileName: 'invalid/genericParams.cddl',
    expectedErrorMessage: 'Rule TypeA has generic params, which are not supported.',
  },
  {
    name: 'invalid - tagged data with multiple type choices',
    cddlFileName: 'invalid/taggedDataWithMultipleTypeChoices.cddl',
    expectedErrorMessage: 'Rule TypeA has TaggedData with 2 type choices, which are not supported.',
  },
  {
    name: 'invalid - multiple group choices',
    cddlFileName: 'invalid/multipleGroupChoices.cddl',
    expectedErrorMessage: 'CDDL contains 2 group choices. Only 1 group choice is supported',
  },
  {
    name: 'invalid - array multiple occurrence symbols',
    cddlFileName: 'invalid/arrayMultipleOccurrenceSymbols.cddl',
    expectedErrorMessage: 'Rule TypeA has array with 2 group entries. Only 1 is supported.',
  },
  {
    name: 'invalid - table multiple occurrence symbols',
    cddlFileName: 'invalid/tableMultipleOccurrenceSymbols.cddl',
    expectedErrorMessage: 'Rule TypeA has table with 2 group entries. Only 1 is supported.',
  },
  {
    name: 'invalid - bareword member key',
    cddlFileName: 'invalid/barewordMemberKey.cddl',
    expectedErrorMessage:
      'Rule TypeA has invalid ValueMemberKey on index 0, while Array has 2 items\n  Missing memberKey',
  },
  {
    name: 'invalid - nested array',
    cddlFileName: 'invalid/nestedArray.cddl',
    expectedErrorMessage:
      'Rule TypeA has invalid ValueMemberKey "field2":\n  Nested arrays are not supported. Wrap the inner array to a new type.',
  },
  {
    name: 'invalid - cut',
    cddlFileName: 'invalid/cut.cddl',
    expectedErrorMessage: 'Rule TypeA contains table with cut, which is not supported.',
  },
]
