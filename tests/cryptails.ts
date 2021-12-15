import * as anchor from '@project-serum/anchor';
const utf8 = anchor.utils.bytes.utf8;
const spl = require("@solana/spl-token");
const serumCmn = require("@project-serum/common");
import { Program } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { Cryptails } from '../target/types/cryptails';

const { PublicKey, SystemProgram, Keypair, SYSVAR_RENT_PUBKEY } = anchor.web3;

async function getTokenAccount(provider, addr) {
  return await serumCmn.getTokenAccount(provider, addr);
}

async function createMint(provider, authority) {
  if (authority === undefined) {
    authority = provider.wallet.publicKey;
  }
  const mint = await spl.Token.createMint(
    provider.connection,
    provider.wallet.payer,
    authority,
    null,
    0,
    TOKEN_PROGRAM_ID
  );
  return mint;
}

describe('cryptails', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Cryptails as Program<Cryptails>;

  it('Is created!', async () => {
    const provider = anchor.Provider.local();
    const myAccount = anchor.web3.Keypair.generate();
    const tokenAccount = anchor.web3.Keypair.generate();

    const mint = await createMint(provider);

    // Add your test here.
    const tx = await program.rpc.create(Buffer.from("name"), {
      accounts: {
        cryptails: myAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenAccount: tokenAccount.publicKey,
        mint: mint.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [myAccount, tokenAccount],
    });
    console.log("Your transaction signature", tx);
    const account = await program.account.cryptails.fetch(myAccount.publicKey);
    console.log(account);
    const tokenAccountRes = await getTokenAccount(
      provider,
      tokenAccount.publicKey,
    );
    console.log(tokenAccountRes)
    console.log(provider.wallet.publicKey)
  });
});
