import Head from 'next/head'
import { useRouter } from 'next/router'
import Container from '../../components/Container'

export default function Token() {
  const router = useRouter()
  const { id } = router.query
  return (
    <Container id={`token-${id}-page`} className="py-4 md:py-8 lg:py-12" maxWidth="2xl">
      <Head>
        <title>Token {id} | RadioShack</title>
        <meta key="description" name="description" content="RadioShack Swap tokens." />
      </Head>
    </Container>
  )
}
