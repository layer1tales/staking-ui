import classNames from 'classnames'
import type { AllowedTokenData } from 'hooks/useAllowedTokenDatas'
import type { StakeEntryTokenData } from 'hooks/useStakedTokenDatas'
import { useStakePoolMetadataCtx } from 'providers/StakePoolMetadataProvider'

// Since TokenDataType is a union, the select function needs to handle both cases.
type TokenDataType = AllowedTokenData | StakeEntryTokenData

interface TokenWrapperProps {
  select: (tokenData: TokenDataType, amount?: string) => void
  selected: boolean
  children: React.ReactNode
  token: TokenDataType // Accepts both types.
}

export const TokenWrapper = ({
  token,
  children,
  selected,
  select,
}: TokenWrapperProps) => {
  const { data: stakePoolMetadata } = useStakePoolMetadataCtx()

  // Adjust the onClick to handle the complex nature of tokenData.
  // Ensure that the function that uses TokenWrapper is prepared to handle both types.
  const handleClick = () => {
    if ('stakeEntry' in token) {
      // This ensures you're dealing with StakeEntryTokenData.
      select(token)
    } else {
      // Handle AllowedTokenData case or log an error/throw an exception if needed.
      console.log(
        "Token does not have 'stakeEntry', handling as AllowedTokenData",
      )
      select(token)
    }
  }

  return (
    <div
      className={classNames([
        'relative flex cursor-pointer flex-col rounded-2xl border-4',
        {
          'border-orange-500 shadow-lg':
            selected && !stakePoolMetadata?.colors?.secondary,
          'border-gray-700': !selected,
        },
      ])}
      onClick={handleClick} // Use handleClick to discern the type before calling select
      style={{
        borderColor: selected ? stakePoolMetadata?.colors?.secondary : '',
        boxShadow: selected
          ? `0px 0px 20px ${stakePoolMetadata?.colors?.secondary || '#FFFFFF'}`
          : '',
      }}
    >
      {children}
    </div>
  )
}
