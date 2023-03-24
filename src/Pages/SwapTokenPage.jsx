import React from 'react'
import { useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'
import TokenSwapUi from '../Components/TokenSwapUi'
function SwapTokenPage() {
 return (
  <TokenSwapUi />
 )
}

export default SwapTokenPage