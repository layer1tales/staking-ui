import type { IdlAccountData } from '@l1t/rewards-center'
import { rewardsCenterProgram } from '@l1t/rewards-center'
import { getStakeAuthorizationsForPool } from '@cardinal/staking/dist/cjs/programs/stakePool/accounts'
import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { asWallet } from 'common/Wallets'
import { useEnvironmentCtx } from 'providers/EnvironmentProvider'

import { isStakePoolV2, useStakePoolData } from './useStakePoolData'

export const useStakeAuthorizationsForPool = () => {
  const { secondaryConnection } = useEnvironmentCtx()
  const { data: stakePoolData } = useStakePoolData()
  const wallet = useWallet()

  return useQuery<
    | Pick<IdlAccountData<'stakeAuthorizationRecord'>, 'pubkey' | 'parsed'>[]
    | undefined
  >(
    ['useStakeAuthorizationsForPool', stakePoolData?.pubkey?.toString()],
    async () => {
      if (stakePoolData?.pubkey && stakePoolData.parsed) {
        if (isStakePoolV2(stakePoolData.parsed)) {
          const program = rewardsCenterProgram(
            secondaryConnection,
            asWallet(wallet)
          )
          const stakeAuth = await program.account.stakeAuthorizationRecord.all([
            {
              memcmp: {
                offset: 9,
                bytes: stakePoolData.pubkey.toString(),
              },
            },
          ])
          return stakeAuth.map((e) => {
            return { pubkey: e.publicKey, parsed: e.account }
          })
        } else {
          return await getStakeAuthorizationsForPool(
            secondaryConnection,
            stakePoolData.pubkey
          )
        }
      }
    },
    { enabled: !!stakePoolData?.pubkey }
  )
}
