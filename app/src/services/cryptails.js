import { Program, web3, BN } from '@project-serum/anchor';
import * as spl from '@solana/spl-token';

import { getProvider } from './provider';
import { createTokenAccounts } from './helpers';
import { isCryptailOnSell } from './marketplace';
import idl from '../idl/cryptails.json';

const { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } = web3;

const PROGRAM_ID = new PublicKey(idl.metadata.address);

export async function createCryptail(wallet, name, ingridients, method) {
  const program = await createProgram(wallet);
  const { provider } = program; 

  const [cryptailAccount, cryptailAccountBump] = await PublicKey.findProgramAddress(
    [Buffer.from(name)],
    PROGRAM_ID,
  );

  // mint owner - new PDA cryptail account
  // move to program
  // seems it is possible to console log private key of mint adn token acc
  const { mintAccount, tokenAccount } = await createTokenAccounts(provider, cryptailAccount);

  await program.rpc.create(
    Buffer.from(name), 
    Buffer.from(ingridients), 
    Buffer.from(method), 
    new BN(cryptailAccountBump), 
    {
      accounts: {
        cryptail: cryptailAccount,
        user: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        tokenAccount: tokenAccount.publicKey,
        mint: mintAccount.publicKey,
        rent: SYSVAR_RENT_PUBKEY,
      },
      signers: [],
    }
  );
  const cryptailAcc = await program.account.cryptail.fetch(cryptailAccount);

  return cryptailAcc;
}

export async function listAllCryptails(wallet, owner) {
  let list = []

  const program = await createProgram(wallet);
  const programAccounts = await program.provider.connection.getProgramAccounts(PROGRAM_ID)

  for(let programAccount of programAccounts) {
    // fetch specific cryptail account
    const cryptailAcc = await program.account.cryptail.fetch(programAccount.pubkey);

    if (cryptailAcc.ownerAccount.toString() === wallet.publicKey.toString()) {
      const isOnSell = await isCryptailOnSell(wallet, cryptailAcc.name);
      cryptailAcc.canBeSold = !isOnSell;
    }

    cryptailAcc.cryptailAccount = programAccount.pubkey;

    list.push(cryptailAcc)
  }

  return list;
}

async function createProgram(wallet) {
  const provider = await getProvider(wallet);

  return new Program(idl, PROGRAM_ID, provider);
}

