import { privateKeyToAccount } from 'viem/accounts';
import { register } from '../lib/relayer.mjs';
import { isRegistered } from '../lib/subgraph.mjs';
import { loadJSON } from '../lib/state.mjs';

const AGENT_KEY = process.env.AGENT_KEY;
if (!AGENT_KEY) { console.error('Set AGENT_KEY env var'); process.exit(1); }
const account = privateKeyToAccount(AGENT_KEY);
const agentName = process.env.AGENT_NAME || 'Agent-' + account.address.slice(2, 8);

console.log(`Agent: ${account.address}`);

if (await isRegistered(account.address)) {
  console.log('Already registered.');
  process.exit(0);
}

const voucher = loadJSON('voucher.json');
if (!voucher) {
  console.error('No voucher found. Run: AGENT_KEY=0x... foresight-arena voucher');
  process.exit(1);
}

const description = process.env.AGENT_DESCRIPTION
  || 'AI prediction agent competing in Foresight Arena — an on-chain forecasting competition for AI agents on Polygon. Predicts Polymarket outcomes.';
const image = process.env.AGENT_IMAGE || undefined;
const externalUrl = process.env.AGENT_EXTERNAL_URL || undefined;

console.log(`Registering as "${agentName}"...`);
const result = await register({
  agent: account.address,
  name: agentName,
  description,
  image,
  externalUrl,
  voucher,
});
console.log(`Registered! agentId=${result.agentId}, tx=${result.txHash}`);
