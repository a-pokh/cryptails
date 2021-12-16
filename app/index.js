const anchor = require('@project-serum/anchor');
const utf8 = anchor.utils.bytes.utf8;
const spl = require("@solana/spl-token");
const serumCmn = require("@project-serum/common");

const { PublicKey, SystemProgram, Keypair, SYSVAR_RENT_PUBKEY } = anchor.web3;
// Configure the client to use the local cluster.
anchor.setProvider(anchor.Provider.env());

// Read the generated IDL.
const idl = JSON.parse(require('fs').readFileSync('./target/idl/cryptails.json', 'utf8'));

// Address of the deployed program.
const programId = new PublicKey('CELEWojrkyqTYFqkevnTQi6rtLwwSMTbRc5vZAy2KwPc');

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
    spl.TOKEN_PROGRAM_ID
  );
  return mint;
}

async function createTokenAccount(provider, mint, owner) {
  return await serumCmn.createTokenAccount(provider, mint, owner);
}

const program = new anchor.Program(idl, programId);


(async() => {
  const SHOULD_INIT = false
    const NAME = 'test_name' + Math.random();
    const [cryptailsAccount, cryptailsAccountBump] = await PublicKey.findProgramAddress(
      [Buffer.from("cryptails_acc")],
      programId
    )
    const [cryptailAccount, cryptailAccountBump] = await PublicKey.findProgramAddress(
      [Buffer.from(NAME)],
      programId
    )

  console.log(cryptailAccount.toString())
  console.log(cryptailsAccount.toString())
  console.log(cryptailAccountBump)
  console.log(cryptailsAccountBump)

    const provider = anchor.Provider.local();
    const mint = await createMint(provider, cryptailsAccount);
    const tokenAccount = await createTokenAccount(provider, mint.publicKey, provider.wallet.publicKey);
  console.log(tokenAccount)


  if(SHOULD_INIT) {
    // as init_if_needed works weird - dispatch init only once and separately for now
    const txInit = await program.rpc.init({
      accounts: {
        cryptails: cryptailsAccount,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [],
    });
  }
    // Add your test here.
    const tx = await program.rpc.create(Buffer.from(NAME), new anchor.BN(cryptailAccountBump), {
      accounts: {
        cryptails: cryptailsAccount,
        cryptail: cryptailAccount,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        tokenAccount: tokenAccount,
        mint: mint.publicKey,
        rent: SYSVAR_RENT_PUBKEY,
      },
      signers: [],
    });
    console.log("Your transaction signature", tx);

    const account = await program.account.cryptails.fetch(cryptailsAccount);
    const cryptailAcc = await program.account.cryptail.fetch(cryptailAccount);
    console.log(cryptailAcc)
    console.log(account);
})()
