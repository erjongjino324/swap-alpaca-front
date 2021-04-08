import React, { useState } from 'react'
import { Token, TokenAmount, WETH } from '@sushiswap/sdk'
import { Alert, Dots, Button, Checkbox } from 'kashi/components'
import { Input as NumericalInput } from 'components/NumericalInput'
import { ArrowDownRight } from 'react-feather'
import { useActiveWeb3React } from 'hooks'
import { BigNumber } from '@ethersproject/bignumber'
import { BENTOBOX_ADDRESS } from 'kashi/constants'
import { minimum, e10 } from 'kashi/functions/math'
import { TransactionReview } from 'kashi/entities/TransactionReview'
import TransactionReviewView from 'kashi/components/TransactionReview'
import { KashiCooker } from 'kashi/entities/KashiCooker'
import QuestionHelper from 'components/QuestionHelper'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { Warnings } from 'kashi/entities/Warnings'

interface BorrowProps {
  pair: any
}

export default function Borrow({ pair }: BorrowProps) {
  const { account, chainId, library } = useActiveWeb3React()

  // State
  const [useBentoCollateral, setUseBentoCollateral] = useState<boolean>(pair.collateral.bentoBalance.gt(0))
  const [useBentoBorrow, setUseBentoBorrow] = useState<boolean>(true)
  const [collateralValue, setCollateralValue] = useState('')
  const [borrowValue, setBorrowValue] = useState('')
  const [swap, setSwap] = useState(false)

  const [approvalState, approve] = useApproveCallback(
    new TokenAmount(
      new Token(
        chainId || 1,
        pair.collateral.address,
        pair.collateral.decimals,
        pair.collateral.symbol,
        pair.collateral.name
      ),
      collateralValue.toBigNumber(pair.collateral.decimals).toString()
    ),
    BENTOBOX_ADDRESS
  )
  // Calculated
  const balance = useBentoCollateral ? pair.collateral.bentoBalance : pair.collateral.balance

  const nextUserCollateralValue = pair.userCollateralAmount.value.add(
    collateralValue.toBigNumber(pair.collateral.decimals)
  )

  const nextBorrowValue = pair.currentUserBorrowAmount.value.add(borrowValue.toBigNumber(pair.asset.decimals))

  const nextMaxBorrowableOracle = nextUserCollateralValue.muldiv(e10(16).mul('75'), pair.oracleExchangeRate)
  const nextMaxBorrowableSpot = nextUserCollateralValue.muldiv(e10(16).mul('75'), pair.spotExchangeRate)
  const nextMaxBorrowableStored = nextUserCollateralValue.muldiv(e10(16).mul('75'), pair.currentExchangeRate)
  const nextMaxBorrowMinimum = minimum(nextMaxBorrowableOracle, nextMaxBorrowableSpot, nextMaxBorrowableStored)
  const nextMaxBorrowSafe = nextMaxBorrowMinimum
    .muldiv('95', '100')
    .sub(pair.currentUserBorrowAmount.value.add(borrowValue.toBigNumber(pair.asset.decimals)))
  const nextMaxBorrowPossible = minimum(nextMaxBorrowSafe, pair.totalAssetAmount.value)

  const nextHealth = nextBorrowValue.muldiv('1000000000000000000', nextMaxBorrowMinimum)

  const maxCollateral = balance.toFixed(pair.collateral.decimals)

  const maxBorrow = collateralValue
    ? nextMaxBorrowPossible.toFixed(pair.asset.decimals)
    : pair.maxBorrowable.possible.string

  const transactionReview = new TransactionReview()
  if (collateralValue || borrowValue) {
    transactionReview.addTokenAmount('Borrow Limit', pair.maxBorrowable.safe.value, nextMaxBorrowSafe, pair.asset)
    transactionReview.addTokenAmount('Health', pair.health.value, nextHealth, pair.asset)
  }

  const warnings = new Warnings()
    .add(pair.currentExchangeRate.isZero(), 'Oracle exchange rate has NOT been set', true)
    .add(
      borrowValue.length > 0 && nextUserCollateralValue.eq(0),
      'You have insufficient collateral. Please enter a smaller amount, add more collateral, or repay now.',
      true
    )
    .add(
      pair.maxBorrowable.safe.value.lt(0),
      'You have surpassed your borrow limit and assets are at a high risk of liquidation.',
      true
    )
    .add(borrowValue.length > 0 && nextMaxBorrowPossible.lt(0), 'Not enough liquidity in this pair.', true)
    .add(
      borrowValue.length > 0 && nextMaxBorrowSafe.lt(BigNumber.from(0)),
      'You will surpass your safe borrow limit and assets will be at a high risk of liquidation.',
      false
    )

  // Handlers
  async function onBorrow() {
    const cooker = new KashiCooker(pair, account, library, chainId)
    /*
    if (collateralValue.toBigNumber(pair.collateral.decimals).gt(0)) {
      if (useBentoCollateral) {
        await addCollateral(
          pair.address,
          pair.collateral.address,
          collateralValue.toBigNumber(pair.collateral.decimals)
        )
      } else {
        await depositAddCollateral(
          pair.address,
          pair.collateral.address,
          collateralValue.toBigNumber(pair.collateral.decimals)
        )
      }
    }

    if (borrowValue.toBigNumber(pair.asset.decimals).gt(0)) {
      if (useBentoBorrow) {
        await borrow(pair.address, pair.asset.address, borrowValue.toBigNumber(pair.asset.decimals))
      } else {
        await borrowWithdraw(pair.address, pair.asset.address, borrowValue.toBigNumber(pair.asset.decimals))
      }
    }*/
  }

  function onLeverage() {
    //
  }

  const showApprove =
    chainId &&
    pair.collateral.address !== WETH[chainId].address &&
    !useBentoCollateral &&
    collateralValue &&
    (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)

  return (
    <>
      <div className="text-3xl text-high-emphesis mt-6 mb-4">Borrow {pair.asset.symbol}</div>

      <div className="flex items-center justify-between my-4">
        <div className="flex items-center text-base text-secondary">
          <span>
            <ArrowDownRight size="1rem" style={{ display: 'inline' }} />
          </span>
          <span className="mx-2">Add Collateral From</span>
          <span>
            <Button
              variant="outlined"
              color="pink"
              className="focus:ring focus:ring-pink"
              onClick={() => {
                setUseBentoCollateral(!useBentoCollateral)
              }}
            >
              {useBentoCollateral ? 'BentoBox' : 'Wallet'}
            </Button>
          </span>
        </div>
        <div className="text-base text-secondary" style={{ display: 'inline', cursor: 'pointer' }}>
          Balance: {Math.max(0, maxCollateral)}
        </div>
      </div>

      <div className="flex items-center relative w-full mb-4">
        <NumericalInput
          className="w-full p-3 bg-input rounded focus:ring focus:ring-pink"
          value={collateralValue}
          onUserInput={setCollateralValue}
        />
        {account && (
          <Button
            variant="outlined"
            color="pink"
            onClick={() => setCollateralValue(maxCollateral)}
            className="absolute right-4 focus:ring focus:ring-pink"
          >
            MAX
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between my-4">
        <div className="flex items-center text-base text-secondary">
          <span>
            <ArrowDownRight size="1rem" style={{ display: 'inline' }} />
          </span>
          <span className="mx-2"> Borrow Asset To </span>
          <span>
            <Button
              variant="outlined"
              color="pink"
              className="focus:ring focus:ring-pink"
              onClick={() => {
                setUseBentoBorrow(!useBentoBorrow)
              }}
            >
              {useBentoBorrow ? 'BentoBox' : 'Wallet'}
            </Button>
          </span>
        </div>
        <div className="text-base text-secondary" style={{ display: 'inline', cursor: 'pointer' }}>
          Max: {Math.max(0, Number(maxBorrow))}
        </div>
      </div>

      <div className="flex items-center relative w-full mb-4">
        <NumericalInput
          className="w-full p-3 bg-input rounded focus:ring focus:ring-pink"
          value={borrowValue}
          onUserInput={setBorrowValue}
        />
        {account && (
          <Button
            variant="outlined"
            color="pink"
            onClick={() => {
              setBorrowValue(maxBorrow)
            }}
            className="absolute right-4 focus:ring focus:ring-pink"
          >
            MAX
          </Button>
        )}
      </div>

      {warnings.map((warning, i) => (
        <Alert key={i} type={warning.breaking ? 'error' : 'warning'} message={warning.message} className="mb-4" />
      ))}

      <div className="flex items-center mb-4">
        <Checkbox color="pink" checked={swap} onChange={event => setSwap(event.target.checked)} />
        <span className="text-secondary ml-2 mr-1">
          Swap {pair.asset.symbol} for {pair.collateral.symbol}
        </span>
        <QuestionHelper text="Lorem ipsum dolor sit amet." />
      </div>

      <TransactionReviewView transactionReview={transactionReview}></TransactionReviewView>

      {showApprove && (
        <Button color="pink" onClick={approve}>
          {approvalState === ApprovalState.PENDING ? (
            <Dots>Approving {pair.collateral.symbol}</Dots>
          ) : (
            `Approve ${pair.collateral.symbol}`
          )}
        </Button>
      )}

      {!showApprove && (
        <Button
          color="pink"
          onClick={onBorrow}
          disabled={
            (balance.eq(0) && pair.userCollateralAmount.value.eq(0)) || warnings.some(warning => warning.breaking)
          }
        >
          Borrow
        </Button>
      )}
    </>
  )
}
