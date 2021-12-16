import { WNATIVE_ADDRESS } from '@radioshackswap/sdk'
import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { AddressZero } from '@ethersproject/constants'
import { useCallback } from 'react'
import { useActiveWeb3React } from '../services/web3'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useBentoBoxContract } from './useContract'

function useBentoBox() {
  const { account, chainId } = useActiveWeb3React()

  const addTransaction = useTransactionAdder()
  const bentoBoxContract = useBentoBoxContract()

  const deposit = useCallback(
    async (tokenAddress: string, value: BigNumber) => {
      if (value && chainId) {
        try {
          const tokenAddressChecksum = getAddress(tokenAddress)
          if (tokenAddressChecksum === WNATIVE_ADDRESS[chainId]) {
            const tx = await bentoBoxContract?.deposit(AddressZero, account, account, value, 0, {
              value,
            })
            return addTransaction(tx, { summary: 'Deposit to Bentobox' })
          } else {
            const tx = await bentoBoxContract?.deposit(tokenAddressChecksum, account, account, value, 0)
            return addTransaction(tx, { summary: 'Deposit to Bentobox' })
          }
        } catch (e) {
          console.error('bentobox deposit error:', e)
          return e
        }
      }
    },
    [account, addTransaction, bentoBoxContract, chainId]
  )

  const withdraw = useCallback(
    // todo: this should be updated with BigNumber as opposed to string
    async (tokenAddress: string, value: BigNumber) => {
      if (value && chainId) {
        try {
          const tokenAddressChecksum = getAddress(tokenAddress)
          const tx = await bentoBoxContract?.withdraw(
            tokenAddressChecksum === WNATIVE_ADDRESS[chainId]
              ? '0x0000000000000000000000000000000000000000'
              : tokenAddressChecksum,
            account,
            account,
            value,
            0
          )
          return addTransaction(tx, { summary: 'Withdraw from Bentobox' })
        } catch (e) {
          console.error('bentobox withdraw error:', e)
          return e
        }
      }
    },
    [account, addTransaction, bentoBoxContract, chainId]
  )

  return { deposit, withdraw }
}

export default useBentoBox
