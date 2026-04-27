// Crypto primitives
export { packPredictions, computeCommitHash, generateSalt, canonicalize, hashContent } from './lib/crypto.mjs';

// Subgraph queries
export { querySubgraph, getActiveRounds, getRound, getNonce, getScore, getAllScores, isRegistered } from './lib/subgraph.mjs';

// Gasless relayer (EIP-712)
export { gaslessCommit, gaslessReveal, register, requestChallenge, verifyTweet, postReasoning } from './lib/relayer.mjs';

// Polymarket data
export { getMarket, getMarkets, getPriceHistory, summarizeMarket } from './lib/markets.mjs';

// State persistence
export { getStateDir, loadJSON, saveJSON, getRevealQueue, saveRevealQueue } from './lib/state.mjs';
