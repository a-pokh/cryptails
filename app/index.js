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
const programId = new PublicKey('73v77cSsjHeZPoJQteYfphXTiqLWpHDHnnpm87TPJPzn');

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

const program = new anchor.Program(idl, programId);

(async() => {
    const provider = anchor.Provider.local();
    const myAccount = Keypair.generate();
    const tokenAccount = Keypair.generate();

    const mint = await createMint(provider);

    // Add your test here.
    const tx = await program.rpc.create(Buffer.from("name"), {
      accounts: {
        cryptails: myAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        tokenAccount: tokenAccount.publicKey,
        mint: mint.publicKey,
        rent: SYSVAR_RENT_PUBKEY,
      },
      signers: [myAccount, tokenAccount],
    });
    console.log("Your transaction signature", tx);
    const account = await program.account.cryptails.fetch(myAccount.publicKey);
    console.log(account.tokenAccounts[0].toString());
    const tokenAccountRes = await getTokenAccount(
      provider,
      tokenAccount.publicKey,
    );
    console.log(tokenAccountRes)
})()
