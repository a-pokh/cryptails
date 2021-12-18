const anchor = require('@project-serum/anchor');
const spl = require("@solana/spl-token");
const serumCmn = require("@project-serum/common");
const data = require('./data');

const { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } = anchor.web3;
// Configure the client to use the local cluster.
anchor.setProvider(anchor.Provider.env());

// Read the generated IDL.
const idl = JSON.parse(require('fs').readFileSync('./target/idl/cryptails.json', 'utf8'));

// Address of the deployed program.
const programId = new PublicKey(data.programId);

//TODO: try move token and mint accounts init to program
async function createMint(provider, authority) {
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
    const NAME = 'test_name' + Math.random();
    const [cryptailAccount, cryptailAccountBump] = await PublicKey.findProgramAddress(
      [Buffer.from(NAME)],
      programId
    )

    const provider = anchor.Provider.local();
    const mint = await createMint(provider, cryptailAccount);
    const tokenAccount = await createTokenAccount(provider, mint.publicKey, provider.wallet.publicKey);

    console.log("create " + NAME)
    // Add your test here.
    const tx = await program.rpc.create(Buffer.from(NAME), new anchor.BN(cryptailAccountBump), {
      accounts: {
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
    const cryptailAcc = await program.account.cryptail.fetch(cryptailAccount);
    console.log(cryptailAcc)
})()
