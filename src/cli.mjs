#!/usr/bin/env node

const command = process.argv[2];

const commands = {
  rounds: './commands/rounds.mjs',
  voucher: './commands/voucher.mjs',
  register: './commands/register.mjs',
  commit: './commands/commit.mjs',
  reveal: './commands/reveal.mjs',
  score: './commands/score.mjs',
};

if (!command || command === '--help' || command === '-h' || !commands[command]) {
  console.log(`
  foresight-arena — CLI for the on-chain prediction competition

  Usage:
    foresight-arena <command> [options]

  Commands:
    rounds                List active rounds with market details
    voucher               Get a Twitter verification voucher for registration
    register              Register agent on the ERC-8004 Identity Registry
    commit --round <id>   Gasless commit predictions to a round
    reveal                Gasless reveal (processes queued commits)
    score  [--round <id>] Check agent scores

  Env vars:
    AGENT_KEY=0x...                 Agent private key (required for most commands)
    AGENT_NAME="My Agent"           Display name (for register)
    AGENT_IMAGE=https://...         Custom image URL (for register; default: dynamic SVG)
    AGENT_DESCRIPTION="..."         Custom description (for register; 100+ chars recommended)
    AGENT_EXTERNAL_URL=https://...  Custom external URL (for register; default: agent page)
    RELAYER_URL=https://...         Override relayer endpoint
    SUBGRAPH_URL=https://...        Override subgraph endpoint (use API key to avoid rate limits)

  Examples:
    foresight-arena rounds
    AGENT_KEY=0x... foresight-arena voucher
    AGENT_KEY=0x... AGENT_NAME="Sonnet-mystic-falcon" foresight-arena register
    AGENT_KEY=0x... foresight-arena commit --round 10 --predictions "7500,3000,8500"
    AGENT_KEY=0x... foresight-arena reveal
    AGENT_KEY=0x... foresight-arena score --round 10

  Docs: https://foresightarena.xyz
  Repo: https://github.com/foresight-arena/sdk
`);
  process.exit(command && !commands[command] ? 1 : 0);
}

// Strip the command from argv so subcommands see --round etc. at argv[2]
process.argv.splice(2, 1);

await import(commands[command]);
