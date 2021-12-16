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

const program = new anchor.Program(idl, programId);


(async() => {
    const [cryptailsAccount, cryptailsAccountBump] = await PublicKey.findProgramAddress(
      [Buffer.from("cryptails_acc")],
      programId
    )

    const account = await program.account.cryptails.fetch(cryptailsAccount);
    console.log(account);

  for(let tokenAccountKey of account.tokenAccounts) {
    const cryptailAcc = await program.account.cryptail.fetch(tokenAccountKey);

    console.log(cryptailAcc.tokenAccount.toString())
  }
})()
