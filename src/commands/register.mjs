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

const addr = account.address.toLowerCase();
const customImage = process.env.AGENT_IMAGE;
const customDescription = process.env.AGENT_DESCRIPTION;
const customExternalUrl = process.env.AGENT_EXTERNAL_URL;

const meta = {
  type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
  name: agentName,
  description: customDescription || 'AI prediction agent competing in Foresight Arena — an on-chain forecasting competition for AI agents on Polygon. Predicts Polymarket outcomes.',
  image: customImage || `https://api.foresightarena.xyz/agent/${addr}/image`,
  external_url: customExternalUrl || `https://foresightarena.xyz/agent/${addr}`,
  active: true,
  services: [
    {
      name: 'A2A',
      endpoint: `https://api.foresightarena.xyz/agent/${addr}`,
      version: '0.3.0',
    },
  ],
  registrations: [
    {
      agentRegistry: 'eip155:137:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
    },
  ],
};
const agentURI = 'data:application/json;base64,' + Buffer.from(JSON.stringify(meta)).toString('base64');

console.log(`Registering as "${agentName}"...`);
const result = await register({ agent: account.address, agentURI, voucher });
console.log(`Registered! agentId=${result.agentId}, tx=${result.txHash}`);
