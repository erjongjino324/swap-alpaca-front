import { ChainId } from '@radioshackswap/sdk'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Head from 'next/head'
import React from 'react'
import Alert from '../../../components/Alert'
import Container from '../../../components/Container'
import DoubleGlowShadow from '../../../components/DoubleGlowShadow'
import NavLink from '../../../components/NavLink'
import CompletedOrders from '../../../features/legacy/open-order/CompletedOrders'
import OpenOrders from '../../../features/legacy/open-order/OpenOrders'
import NetworkGuard from '../../../guards/Network'
import useLimitOrderApproveCallback, { BentoApprovalState } from '../../../hooks/useLimitOrderApproveCallback'
import useLimitOrders from '../../../hooks/useLimitOrders'

function OpenOrdersPage() {
  const { i18n } = useLingui()
  const [approvalState] = useLimitOrderApproveCallback()
  const { pending } = useLimitOrders()

  return (
    <Container id="open-order-page" className="py-4 md:py-8 lg:py-12" maxWidth="2xl">
      <Head>
        <title>Open Orders | RadioShack</title>
        <meta name="description" content="Open orders..." />
      </Head>
      <div className="min-w-0 md:min-w-[672px]">
        <div className="flex items-center justify-start gap-2 py-3">
          <NavLink href="/limit-order">
            <a className="flex gap-2 text-sm text-secondary">
              <ArrowLeftIcon width={20} height={20} className="text-high-emphesis" />
              {i18n._(t`Back to Limit Orders`)}
            </a>
          </NavLink>
        </div>
        {pending.totalOrders > 0 && approvalState === BentoApprovalState.NOT_APPROVED && (
          <div className="flex pb-6">
            <Alert
              type="error"
              title={i18n._(t`Not approved`)}
              message={i18n._(t`It seems like you have some open orders while the limit order master contract is not yet approved. Please make
          sure you have approved the limit order master contract or the order will not execute`)}
              dismissable={false}
            />
          </div>
        )}
        <DoubleGlowShadow>
          <div id="limit-order-page" className="flex flex-col w-full gap-4 p-3 rounded md:p-5 bg-dark-900">
            <OpenOrders />
            <CompletedOrders />
          </div>
        </DoubleGlowShadow>
      </div>
    </Container>
  )
}

OpenOrdersPage.Guard = NetworkGuard([ChainId.MATIC])

export default OpenOrdersPage
