import { ArrowRightIcon } from '@heroicons/react/outline'
import { I18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import Head from 'next/head'
import Link from 'next/link'
import { useMemo } from 'react'
import Container from '../../components/Container'
import Typography from '../../components/Typography'

const TOOLS = (i18n: I18n) => [
  {
    id: 1,
    name: 'MEOWSHI',
    description: i18n._(t`Redenominate sRADIO into MEOWSHI`),
    href: '/tools/meowshi',
  },
  {
    id: 2,
    name: 'INARI',
    description: 'Deposit RADIO in various strategies & platforms in one click!',
    href: '/inari',
  },
]

export default function Tools() {
  const { i18n } = useLingui()
  const tools = useMemo(() => TOOLS(i18n), [i18n])

  return (
    <Container id="tools-page" className="py-4 space-y-4 md:py-8 lg:py-12" maxWidth="xl">
      <Head>
        <title>Tools | RadioShack</title>
        <meta key="description" name="description" content="RadioShack Swap tools..." />
      </Head>
      <Typography variant="h1" component="h1">
        Tools
      </Typography>
      <ul className="space-y-4 divide-y-0">
        {tools.map((tool) => (
          <li key={tool.id} className="relative w-full p-4 rounded bg-dark-900 hover:bg-dark-800">
            <div className="flex justify-between space-x-4">
              <div className="flex-1 min-w-0">
                <Link href={tool.href}>
                  <a className="flex items-center justify-between focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <div className="space-y-1">
                      <p className="text-xl font-bold truncate text-primary">{tool.name}</p>
                      <p className="text-sm truncate text-secondary">{tool.description}</p>
                    </div>
                    <ArrowRightIcon width={24} height={24} className="text-high-emphesis" />
                  </a>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  )
}
