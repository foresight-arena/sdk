import { privateKeyToAccount } from 'viem/accounts';
import { computeCommitHash, generateSalt } from '../lib/crypto.mjs';
import { gaslessCommit } from '../lib/relayer.mjs';
import { getRound } from '../lib/subgraph.mjs';
import { loadJSON, saveJSON, getRevealQueue, saveRevealQueue } from '../lib/state.mjs';

const AGENT_KEY = process.env.AGENT_KEY;
if (!AGENT_KEY) { console.error('Set AGENT_KEY env var'); process.exit(1); }
const account = privateKeyToAccount(AGENT_KEY);

function parseArg(name) {
  const eq = process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
  if (eq) return eq;
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : null;
}

const roundIdArg = parseArg('round');
const predsArg = parseArg('predictions');

if (!roundIdArg) { console.error('Usage: foresight-arena commit --round <id> [--predictions "7500,3000"]'); process.exit(1); }
const roundId = Number(roundIdArg);

let predictions;
if (predsArg) {
  predictions = predsArg.split(',').map(Number);
} else {
  const saved = loadJSON(`predictions-${roundId}.json`);
  if (saved?.predictions) {
    predictions = saved.predictions;
  } else {
    console.error(`No predictions found for round ${roundId}.`);
    console.error('Pass inline: foresight-arena commit --round ' + roundId + ' --predictions "7500,3000,8500"');
    process.exit(1);
  }
}

const round = await getRound(roundId);
if (!round) { console.error(`Round ${roundId} not found`); process.exit(1); }
const now = Math.floor(Date.now() / 1000);
if (now >= Number(round.commitDeadline)) { console.error('Commit phase has ended'); process.exit(1); }
if (round.invalidated) { console.error('Round is invalidated'); process.exit(1); }
if (predictions.length !== round.conditionIds.length) {
  console.error(`Expected ${round.conditionIds.length} predictions, got ${predictions.length}`);
  process.exit(1);
}

const salt = generateSalt();
const commitHash = computeCommitHash(roundId, predictions, salt);

console.log(`Agent: ${account.address}`);
console.log(`Round: ${roundId} (${predictions.length} markets)`);
console.log(`Predictions: [${predictions.join(', ')}]`);
console.log('Submitting gasless commit...');

const result = await gaslessCommit({ roundId, commitHash, account });
console.log(`Committed! tx=${result.txHash}`);

const queue = getRevealQueue();
queue.push({ roundId, predictions, salt, commitHash, committedAt: new Date().toISOString() });
saveRevealQueue(queue);
console.log('Saved to reveal queue.');
console.log(`\nNext: foresight-arena reveal (after reveal window opens)`);
