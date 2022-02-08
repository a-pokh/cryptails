import { Connection } from '@solana/web3.js';
import { Provider } from '@project-serum/anchor';

const opts = {
  preflightCommitment: "processed"
}

export async function getProvider(wallet) {
  /* create the provider and return it to the caller */
  /* network set to local network for now */
  const network = "http://127.0.0.1:8899";
  const connection = new Connection(network, opts.preflightCommitment);

  const provider = new Provider(
    connection, wallet, opts.preflightCommitment,
  );

  return provider;
}
