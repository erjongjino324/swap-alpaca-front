import React from 'react'
import NavLink from '../../../components/NavLink'
import { currencyId } from '../../../functions/currency'
import { useActiveWeb3React } from '../../../services/web3'

export default function LiquidityHeader({ input = undefined, output = undefined }: any): JSX.Element {
  const { chainId } = useActiveWeb3React()
  return (
    <div className="grid grid-cols-2 rounded-2xl p-2 mx-6 my-0 bg-[#F7F8FA]">
      <NavLink
        activeClassName="font-bold text-high-emphesis bg-[#495D75]"
        href={`/add/${currencyId(input)}/${currencyId(output)}`}
      >
        <a className="flex items-center justify-center px-4 py-2 text-base font-medium text-center rounded-xl md:px-10 text-secondary hover:text-high-emphesis">
          Add
        </a>
      </NavLink>
      <NavLink
        onClick={(event) => {
          if (!output) event.preventDefault()
        }}
        activeClassName="text-high-emphesis font-bold bg-[#495D75]"
        href={`/remove/${currencyId(input)}/${currencyId(output)}`}
      >
        <a className="flex items-center justify-center px-4 py-2 text-base font-medium text-center rounded-xl md:px-10 text-secondary hover:text-high-emphesis">
          Remove
        </a>
      </NavLink>
    </div>
  )
}
