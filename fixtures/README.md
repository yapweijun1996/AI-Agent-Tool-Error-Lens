# Agent Error Lens fixture corpus

`corpus.json` is the frozen V0.1 Golden/adversarial fixture inventory. It defines reproducible request inputs and assertions for future parser tests.

The `expected` object contains assertions rather than a complete canonical result so the corpus can be reviewed before parser implementation. A fixture with `generator` expands deterministically in the validator; it does not execute a command or read a repository file.

Fixture families cover approved producers, stream/terminal/path structure, malformed or bounded input, security redaction, repeated determinism, and downstream agent location/evidence use. A passing corpus check proves inventory and fixture-shape integrity only. It does not prove parser behavior; producer and normalization verification begins in T-004/T-005.
