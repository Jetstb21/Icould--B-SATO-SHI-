/*
  # Insert benchmark requirements and catalog data

  1. Data Insertion
    - Insert benchmark requirements for Satoshi, Hal Finney, and Gavin Andresen
    - Insert requirements catalog with learning resources and examples

  2. Requirements Added
    - Satoshi: 5 requirements across all metrics (target 10)
    - Hal Finney: 1 cryptography requirement (target 9)
    - Gavin Andresen: 1 community requirement (target 9)

  3. Catalog Resources
    - Learning resources for cryptography, coding, distributed systems
    - Templates and examples for writing and community contributions
*/

-- Insert benchmark requirements
INSERT INTO public.benchmark_requirements (benchmark, metric, target, detail, evidence) VALUES
('Satoshi', 'cryptography', 10, 'Implement a reference signature scheme from spec (Ed25519 or ECDSA) and test vectors', 'Repo link + tests'),
('Satoshi', 'coding', 10, 'Contribute a non-trivial PR to a Bitcoin/LN client or BIP tooling', 'Merged PR link'),
('Satoshi', 'writing', 10, 'Publish a technical write-up with original analysis (design, threat model, or improvement)', 'Article link'),
('Satoshi', 'distributedSystems', 10, 'Build & measure a P2P prototype (gossip, NAT, failure scenarios)', 'Repo + benchmark notes'),
('Satoshi', 'economics', 10, 'Argue fee/issuance trade-offs with quantitative model and simulation', 'Notebook or paper link'),
('Hal Finney', 'cryptography', 9, 'Implement and benchmark a reusable-proof or similar construction', 'Repo link'),
('Gavin Andresen', 'community', 9, 'Run public testnet infrastructure or faucet-style service with uptime evidence', 'Service URL + uptime');

-- Insert requirements catalog
INSERT INTO public.requirements_catalog (area, label, url) VALUES
('cryptography', 'Stanford/Coursera "Crypto I" (free)', 'https://www.coursera.org/learn/crypto'),
('cryptography', 'Ed25519 paper & ref impl', 'https://ed25519.cr.yp.to/'),
('coding', 'First "good-first-issue" in Bitcoin Core or LND', 'https://github.com/bitcoin/bitcoin/labels/good%20first%20issue'),
('distributedSystems', 'MIT 6.824 labs (Raft, ShardKV)', 'https://pdos.csail.mit.edu/6.824/'),
('writing', 'Write with the "structure → threat model → tradeoffs" template', 'https://'),
('community', 'Operate a node + publish observability dashboard', 'https://');