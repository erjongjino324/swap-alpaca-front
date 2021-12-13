import { ChainId } from '@alpaca-swap/sdk'
import { parseUnits } from '@ethersproject/units'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import React, { FC, useMemo, useState } from 'react'
import Button from '../../components/Button'
import Dots from '../../components/Dots'
import { RADIO, XRADIO } from '../../config/tokens'
import { tryParseAmount } from '../../functions'
import { ApprovalState } from '../../hooks/useApproveCallback'
import useMeowshi from '../../hooks/useMeowshi'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../modals/TransactionConfirmationModal'
import { Field, MeowshiState } from '../../pages/tools/meowshi'
import { useActiveWeb3React } from '../../services/web3'
import { useTokenBalance } from '../../state/wallet/hooks'

interface MeowshiButtonProps {
  meowshiState: MeowshiState
}

const MeowshiButton: FC<MeowshiButtonProps> = ({ meowshiState }) => {
  const { currencies, meow: doMeow, fields } = meowshiState
  const { i18n } = useLingui()
  const [modalState, setModalState] = useState({
    attemptingTxn: false,
    txHash: '',
    open: false,
  })
  const { account, chainId } = useActiveWeb3React()
  const sushiBalance = useTokenBalance(account, RADIO[chainId])
  const xSushiBalance = useTokenBalance(account, XRADIO[chainId])
  const { approvalState, approve, meow, unmeow, meowSushi, unmeowSushi } = useMeowshi(
    currencies[Field.INPUT] === RADIO[chainId]
  )
  const balance = useTokenBalance(account, currencies[Field.INPUT])
  const parsedInputAmount = tryParseAmount(fields[Field.INPUT], currencies[Field.INPUT])
  const parsedOutputAmount = tryParseAmount(fields[Field.OUTPUT], currencies[Field.OUTPUT])

  const closeModal = () => {
    setModalState((prevState) => ({
      ...prevState,
      open: false,
    }))
  }

  const handleSubmit = async () => {
    setModalState({
      attemptingTxn: true,
      open: true,
      txHash: '',
    })

    let tx
    if (doMeow) {
      if (currencies[Field.INPUT]?.symbol === 'RADIO') {
        tx = await meowSushi({
          value: parseUnits(fields[Field.INPUT], sushiBalance.currency.decimals),
          decimals: sushiBalance.currency.decimals,
        })
      }
      if (currencies[Field.INPUT]?.symbol === 'xRADIO') {
        tx = await meow({
          value: parseUnits(fields[Field.INPUT], sushiBalance.currency.decimals),
          decimals: xSushiBalance.currency.decimals,
        })
      }
    } else {
      if (currencies[Field.OUTPUT]?.symbol === 'RADIO') {
        tx = await unmeowSushi({
          value: parseUnits(fields[Field.INPUT], sushiBalance.currency.decimals),
          decimals: xSushiBalance.currency.decimals,
        })
      }
      if (currencies[Field.OUTPUT]?.symbol === 'xRADIO') {
        tx = await unmeow({
          value: parseUnits(fields[Field.INPUT], sushiBalance.currency.decimals),
          decimals: xSushiBalance.currency.decimals,
        })
      }
    }

    if (tx?.hash) {
      setModalState((prevState) => ({
        ...prevState,
        attemptingTxn: false,
        txHash: tx.hash,
      }))
    } else {
      closeModal()
    }
  }

  const buttonDisabledText = useMemo(() => {
    if (!balance) return i18n._(t`Loading Balance`)
    if (parsedInputAmount?.greaterThan(balance)) return i18n._(t`Insufficient Balance`)
    if (!parsedInputAmount?.greaterThan(0)) return i18n._(t`Please enter an amount`)
    return null
  }, [balance, i18n, parsedInputAmount])

  if (!account)
    return (
      <Button onClick={approve} color="gradient" disabled={true}>
        {i18n._(t`Connect to wallet`)}
      </Button>
    )

  if (chainId !== ChainId.MAINNET)
    return (
      <Button onClick={approve} color="gradient" disabled={true}>
        {i18n._(t`Network not supported yet`)}
      </Button>
    )

  if (approvalState === ApprovalState.PENDING)
    return (
      <Button color="gradient" disabled={true}>
        <Dots>{i18n._(t`Approving`)}</Dots>
      </Button>
    )

  if (approvalState === ApprovalState.NOT_APPROVED)
    return (
      <Button onClick={approve} color="gradient" disabled={!!buttonDisabledText}>
        {buttonDisabledText || i18n._(t`Approve`)}
      </Button>
    )

  if (approvalState === ApprovalState.APPROVED)
    return (
      <>
        <TransactionConfirmationModal
          isOpen={modalState.open}
          onDismiss={closeModal}
          attemptingTxn={modalState.attemptingTxn}
          hash={modalState.txHash}
          content={() => (
            <ConfirmationModalContent
              title={i18n._(t`Confirm convert`)}
              onDismiss={closeModal}
              topContent={() => <span />}
              bottomContent={() => <span />}
            />
          )}
          pendingText={i18n._(
            t`Converting ${parsedInputAmount?.toSignificant(6, { groupSeparator: ',' })} ${
              meowshiState.currencies[Field.INPUT]?.symbol
            } for ${parsedOutputAmount?.toSignificant(6, { groupSeparator: ',' })} ${
              meowshiState.currencies[Field.OUTPUT]?.symbol
            }`
          )}
        />
        <Button onClick={handleSubmit} disabled={!!buttonDisabledText} color="gradient">
          {buttonDisabledText || i18n._(t`Convert`)}
        </Button>
      </>
    )
}

export default MeowshiButton
