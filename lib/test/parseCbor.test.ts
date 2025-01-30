import fs from 'node:fs'
import {describe, expect, test} from 'vitest'
import {parseCbor} from '../src/parseCbor'
import bigNumber from './fixtures/parsedCBOR/bigNumber.json'
import minswapV2Order from './fixtures/parsedCBOR/minswapV2Order.json'
import minswapV2Pool from './fixtures/parsedCBOR/minswapV2Pool.json'
import wingridersLaunchpadNode from './fixtures/parsedCBOR/wingridersLaunchpadNode.json'
import wingridersV2Pool from './fixtures/parsedCBOR/wingridersV2Pool.json'
import wingridersV2RequestAddStakingRewards from './fixtures/parsedCBOR/wingridersV2RequestAddStakingRewards.json'
import wingridersV2RequestRoutedSwap from './fixtures/parsedCBOR/wingridersV2RequestRoutedSwap.json'

describe('parseCbor', () => {
  // https://cexplorer.io/tx/0641401bc37eba936b29aebe9adf98f70fd950c622f97b0a2d157f1a3c4a116f
  test('Parses CBOR for Minswap V2 Order', async () => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/fixtures/cddl/minswapV2Order.cddl`,
      'utf8',
    )
    const parsed = await parseCbor(
      cddlSchema,
      'd8799fd8799f581ca1aa106c1c76acf5ac4515d3583249c432fd06802cb88b58abc09775ffd8799fd8799f581ca1aa106c1c76acf5ac4515d3583249c432fd06802cb88b58abc09775ffd8799fd8799fd8799f581cafacf6bea29fa98ed2fe8e199de4eb49ef1d929374a64943ecf13591ffffffffd87980d8799fd8799f581ca1aa106c1c76acf5ac4515d3583249c432fd06802cb88b58abc09775ffd8799fd8799fd8799f581cafacf6bea29fa98ed2fe8e199de4eb49ef1d929374a64943ecf13591ffffffffd87980d8799f581cf5808c2c990d86da54bfc97d89cee6efa20cd8461616359478d96b4c5820a939812d08cfb6066e17d2914a7272c6b8c0197acdf68157d02c73649cc3efc0ffd8799fd87980d8799f1a773593feff1a75c95830d87980ff1a001e7cc8d87a80ff',
    )
    expect(parsed).toEqual(minswapV2Order)
  })

  // https://cexplorer.io/tx/0641401bc37eba936b29aebe9adf98f70fd950c622f97b0a2d157f1a3c4a116f
  test('Parses CBOR for Minswap V2 Pool', async () => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/fixtures/cddl/minswapV2Pool.cddl`,
      'utf8',
    )
    const parsed = await parseCbor(
      cddlSchema,
      'd8799fd8799fd87a9f581c1eae96baf29e27682ea3f815aba361a0c6059d45e4bfbe95bbd2f44affffd8799f4040ffd8799f581c8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd614c446a65644d6963726f555344ff1b00000069b6d70e281b00000076136d0ec31b00000077042e6d54181e181ed8799f190682ffd87980ff',
    )
    expect(parsed).toEqual(minswapV2Pool)
  })

  // https://preprod.cexplorer.io/tx/61e91db9e9db145a01cc28f2f580feb260d271572d034782cc2a4d81fd04744a
  test('Parses CBOR for WingRiders Launchpad Node', async () => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/fixtures/cddl/wingridersLaunchpadNode.cddl`,
      'utf8',
    )
    const parsed = await parseCbor(
      cddlSchema,
      'd8799fd8799fd8799f581c9916b846579fc7109f6ab82fd94c7d9b47af8694ea8697a167b1bb0800ffffd87a801b0000018a5058c6f01a00989680ff',
    )
    expect(parsed).toEqual(wingridersLaunchpadNode)
  })

  // https://cexplorer.io/tx/2f6f92c5ca5ef1374e11cf35ffea12c0d5be6b0c4629d542d26ba6d50b954eab
  test('Parses CBOR for WingRiders V2 Pool', async () => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/fixtures/cddl/wingridersV2Pool.cddl`,
      'utf8',
    )
    const parsed = await parseCbor(
      cddlSchema,
      'd8799f581cc134d839a64a5dfb9b155869ef3f34280751a622f69958baa8ffd29c4040581cc0ee29a85b13209423b10447d3c2e6a50641a15c57770e27cb9d50734a57696e67526964657273181e0500001927101a001e84801b0000019484da08081a04d524ad1aa84c0cee00000000d87a80d87a80d87980ff',
    )
    expect(parsed).toEqual(wingridersV2Pool)
  })

  // https://cexplorer.io/tx/3fc61e0b48b1a87a1c544c6c1d3004727ec5d760c7fabe50a9a92fddf4038c46
  test('Parses CBOR for WingRiders V2 Request - AddStakingRewards', async () => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/fixtures/cddl/wingridersV2Request.cddl`,
      'utf8',
    )
    const parsed = await parseCbor(
      cddlSchema,
      'd8799f1a001e8480d8799fd8799f581cc75694c984aa6008bc5915ea42d6d4998b4b8c145c3961d6fb6ab3eaffd8799fd8799fd8799f581cc403e1760404ee0ba72afaa833e44d0c656eea2d7122c4b42cd83372ffffffffd8799fd8799f581cc75694c984aa6008bc5915ea42d6d4998b4b8c145c3961d6fb6ab3eaffd8799fd8799fd8799f581cc403e1760404ee0ba72afaa833e44d0c656eea2d7122c4b42cd83372ffffffff80d879801b00000194875b415f4040581cc0ee29a85b13209423b10447d3c2e6a50641a15c57770e27cb9d50734a57696e67526964657273d87d800101ff',
    )
    expect(parsed).toEqual(wingridersV2RequestAddStakingRewards)
  })

  // https://cexplorer.io/tx/cc5a8c03bc638aa6ee67ebfcb0ea63886263ae012b5edf425bd2380ccd66c272
  test('Parses CBOR for WingRiders V2 Request - Routed swap', async () => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/fixtures/cddl/wingridersV2Request.cddl`,
      'utf8',
    )
    const parsed = await parseCbor(
      cddlSchema,
      'd8799f1a003d0900d8799fd87a9f581cc134d839a64a5dfb9b155869ef3f34280751a622f69958baa8ffd29cffd87a80ffd8799fd8799f581c23e523edc7a95c5a9bcb54ca58a8874bff6e7cbd9312775f9fe4fcf1ffd8799fd8799fd8799f581cddc2b7be44d168a2d97c91508e0bc03976c1001dee977ced456cd12fffffffffd8799f1a001e8480d8799fd8799f581c23e523edc7a95c5a9bcb54ca58a8874bff6e7cbd9312775f9fe4fcf1ffd8799fd8799fd8799f581cddc2b7be44d168a2d97c91508e0bc03976c1001dee977ced456cd12fffffffffd8799fd8799f581c23e523edc7a95c5a9bcb54ca58a8874bff6e7cbd9312775f9fe4fcf1ffd8799fd8799fd8799f581cddc2b7be44d168a2d97c91508e0bc03976c1001dee977ced456cd12fffffffff80d879801b0000019239bacecc4040581c8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd614c446a65644d6963726f555344d8799fd879801a130adc3dff0101ffd87b801b0000019239bacecc4040581c1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e50776f726c646d6f62696c65746f6b656ed8799fd87a801a2ca99531ff0101ff',
    )
    expect(parsed).toEqual(wingridersV2RequestRoutedSwap)
  })

  test('Parses big numbers', async () => {
    const cddlSchema = await fs.promises.readFile(
      `${__dirname}/fixtures/cddl/bigNumber.cddl`,
      'utf8',
    )
    const parsed = await parseCbor(
      cddlSchema,
      'c2590119314bb803a030aea5beb513b87a35a2561a236936244b39a7d1d887c564ec56100b698c5c09d7b37c3195e371f6ef215c4f26ba23dc666a9b094139ce0eb6ef633fdf195453ccafb2323e0b0cb4595eaa8ca104aa401e699d9ad8ff3cbd5e557abc1b0ed5ddea6cee2471a4b9acdd4d720caa41a8a537eff2919683dbde7a2571c1651e1b951cf3a8dd3eca0e21f0adcda66aa0737437119903cf92cdd9c5181d236495c643f95cbb9268c79b95c1d9cdd676da6dedab3cdc7ebaac6fbf8dfa6cb045f8ff0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    )
    expect(parsed).toEqual(bigNumber)
  })
})
