import { initConfig } from '../../../utils/config';
import { Keyring, WsProvider } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { membershipTest } from '../membershipCreationTest';
import { councilTest } from '../electingCouncilTest';
import { registerJoystreamTypes } from '@joystream/types';
import { ApiWrapper } from '../../../utils/apiWrapper';
import { v4 as uuid } from 'uuid';
import BN = require('bn.js');
import { assert } from 'chai';

describe('Lead proposal network tests', () => {
  initConfig();
  const keyring = new Keyring({ type: 'sr25519' });
  const nodeUrl: string = process.env.NODE_URL!;
  const sudoUri: string = process.env.SUDO_ACCOUNT_URI!;
  const defaultTimeout: number = 180000;

  const m1KeyPairs: KeyringPair[] = new Array();
  const m2KeyPairs: KeyringPair[] = new Array();

  let apiWrapper: ApiWrapper;
  let sudo: KeyringPair;

  before(async function () {
    this.timeout(defaultTimeout);
    registerJoystreamTypes();
    const provider = new WsProvider(nodeUrl);
    apiWrapper = await ApiWrapper.create(provider);
  });

  membershipTest(m1KeyPairs);
  membershipTest(m2KeyPairs);
  councilTest(m1KeyPairs, m2KeyPairs);

  it('Lead proposal test', async () => {
    // Setup
    sudo = keyring.addFromUri(sudoUri);
    const proposalTitle: string = 'Testing proposal ' + uuid().substring(0, 8);
    const description: string = 'Testing validator count proposal ' + uuid().substring(0, 8);
    const runtimeVoteFee: BN = apiWrapper.estimateVoteForProposalFee();
    await apiWrapper.transferBalanceToAccounts(sudo, m2KeyPairs, runtimeVoteFee);

    // Proposal stake calculation
    const proposalStake: BN = await apiWrapper.getRequiredProposalStake(25, 10000);
    const proposalFee: BN = apiWrapper.estimateProposeLeadFee(description, description, proposalStake, sudo.address);
    await apiWrapper.transferBalance(sudo, m1KeyPairs[0].address, proposalFee.add(proposalStake));
    // const validatorCount: BN = await apiWrapper.getValidatorCount();

    // Proposal creation
    const proposalPromise = apiWrapper.expectProposalCreated();
    await apiWrapper.proposeLead(m1KeyPairs[0], proposalTitle, description, proposalStake, m1KeyPairs[1]);
    const proposalNumber = await proposalPromise;

    // Approving the proposal
    const proposalExecutionPromise = apiWrapper.expectProposalFinalized();
    await apiWrapper.batchApproveProposal(m2KeyPairs, proposalNumber);
    await proposalExecutionPromise;
    const newLead: string = await apiWrapper.getCurrentLeadAddress();
    assert(
      newLead === m1KeyPairs[1].address,
      `New lead has unexpected value ${newLead}, expected ${m1KeyPairs[1].address}`
    );
  }).timeout(defaultTimeout);

  after(() => {
    apiWrapper.close();
  });
});
