import bondingSucceedsInPoA from '../flows/carthage/bondingSucceedsInPoA'
import claimingPayoutsDisabled from '../flows/carthage/claimingPayoutsDisabled'
import nominateSucceedsInPoA from '../flows/carthage/nominateSucceedsInPoA'
import validateSucceedsInPoA from '../flows/carthage/validateSucceedsInPoA'
import constantAuthorities from '../flows/carthage/constantAuthorities'
import { scenario } from '../Scenario'
import authoritiesDoGetTips from '../flows/carthage/authoritiesDoGetTips'
import nextActiveEraIsNoneInPoA from '../flows/carthage/nextActiveEraIsNoneInPoA'
import eraRewardIsZero from '../flows/carthage/eraRewardIsZero'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
scenario('Carthage PoA setup', async ({ job }) => {
  // job('authority set is constant', constantAuthorities)
  // job('current era is none', nextActiveEraIsNoneInPoA)
  // job('authorities do get tips', authoritiesDoGetTips)
  // job('nominate succeeds in PoA', nominateSucceedsInPoA)
  // job('validate succeeds in PoA', validateSucceedsInPoA)
  // job('bonding succeeds in PoA', bondingSucceedsInPoA)
  // job('claiming payout disabled in PoA', claimingPayoutsDisabled)
  job('era points reward are zero for genesis authorities', eraRewardIsZero)
  // job zero reward payout for validators achieved: verify that gen authorities can bond less than the min amount
  // state ful reward curve: if current era is zero: na o reward curve
})
