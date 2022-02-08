import {
  Keypair,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import * as spl from '@solana/spl-token';
import * as serumCmn from '@project-serum/common';

export async function createTokenAccounts(provider, authority) {
  const { connection, wallet } = provider;
  const mintAccount = new Keypair();
  const tokenAccount = new Keypair();

  const balanceNeeded = await spl.Token.getMinBalanceRentForExemptMint(
    connection,
  );

  const transaction = new Transaction();
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mintAccount.publicKey,
      lamports: balanceNeeded,
      space: spl.MintLayout.span,
      programId: spl.TOKEN_PROGRAM_ID,
    }),
  );

  transaction.add(
    spl.Token.createInitMintInstruction(
      spl.TOKEN_PROGRAM_ID,
      mintAccount.publicKey,
      0,
      authority,
      null,
    ),
  );

  const tokenAccountIxs = await serumCmn.createTokenAccountInstrs(provider, tokenAccount.publicKey, mintAccount.publicKey, provider.wallet.publicKey);
  transaction.add(...tokenAccountIxs);

  let { blockhash } = await connection.getRecentBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  transaction.sign(mintAccount, tokenAccount);
  let signed = await wallet.signTransaction(transaction);
  let txid = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(txid);
  
  return { mintAccount, tokenAccount };
}

