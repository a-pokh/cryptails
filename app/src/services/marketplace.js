import { Program, web3, BN } from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import * as serumCmn from '@project-serum/common';

import { getProvider } from './provider';
import idl from '../idl/marketplace.json';

const { PublicKey, SystemProgram } = web3;

const PROGRAM_ID = new PublicKey(idl.metadata.address);

export async function isCryptailOnSell(wallet, name) {
  const program = await createProgram(wallet);
  const { provider } = program; 
  const { marketplaceItem } = await getMarketplaceItemAccount(name);
  const accountInfo = await provider.connection.getAccountInfo(marketplaceItem);

  // if account info exists - then item with this name is selling on marketplace
  return !!accountInfo;
}

export async function sellCryptail(wallet, cryptailAccount, cryptail, price) {
  const { name, tokenMintAccount, tokenAccount } = cryptail;
  const program = await createProgram(wallet);
  const { provider } = program; 

  const {
    marketplaceItem,
    marketplaceItemBump,
    marketplaceItemSeed,
  } = await getMarketplaceItemAccount(name);

  const mpTokenAccount = await createMpTokenAccount(provider, tokenMintAccount, marketplaceItem)

  await program.rpc.sell(new BN(price), Buffer.from(marketplaceItemSeed), new BN(marketplaceItemBump), {
    accounts: {
      marketplaceItem,
      sellerTokenAccount: tokenAccount,
      mpTokenAccount,
      cryptail: cryptailAccount,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: spl.TOKEN_PROGRAM_ID,
    },
    signers: [],
  });

  const cryptailAcc = await program.account.cryptail.fetch(cryptailAccount);

  return cryptailAcc;
}

export async function listMarketplace(wallet) {
  const program = await createProgram(wallet);
  const { provider } = program; 
  // get all token accounts in wallet by token program id
  const { value: walletTokenAccounts } = await provider.connection.getTokenAccountsByOwner(
    provider.wallet.publicKey, 
    { programId: spl.TOKEN_PROGRAM_ID }
  );

  const programAccounts = await provider.connection.getProgramAccounts(PROGRAM_ID);

  let list = [];

  // get list of all wallet token pubkes strings
  const walletTokenPubkeys = walletTokenAccounts.map(({pubkey}) => pubkey.toString());
  const programAccountsKeys = programAccounts.map(({ pubkey }) => pubkey);
  const dataAccounts = await program.account.marketplaceItem.fetchMultiple(programAccountsKeys);

  console.log(dataAccounts)

  for(let programAccount of programAccounts) {
    console.log(programAccount)
    // fetch specific cryptail account
    const cryptailAcc = await program.account.cryptail.fetch(programAccount.pubkey);

    // TODO: find out if such chek is secure
    // if this cryptail account belongs to user's wallet add it to result
    if(walletTokenPubkeys.includes(cryptailAcc.tokenAccount.toString())) {
      list.push(cryptailAcc);
    }
  }

  return list;
}

//TODO: create on rpc sell to get rid of extra transaction
async function createMpTokenAccount(provider, mint, marketplaceId) {
  return await serumCmn.createTokenAccount(provider, mint, marketplaceId);
}

async function createProgram(wallet) {
  const provider = await getProvider(wallet);

  return new Program(idl, PROGRAM_ID, provider);
}

const SEED_PART = 'mp';
async function getMarketplaceItemAccount(name) {
  const seed = name + SEED_PART;
  const [marketplaceItem, marketplaceItemBump] = await PublicKey.findProgramAddress(
    [Buffer.from(seed)],
    PROGRAM_ID,
  );

  return { marketplaceItem, marketplaceItemBump, marketplaceItemSeed: seed };
}
