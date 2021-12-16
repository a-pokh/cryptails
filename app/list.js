const anchor = require('@project-serum/anchor');
const data = require('./data');

const { PublicKey } = anchor.web3;
// Configure the client to use the local cluster.
anchor.setProvider(anchor.Provider.env());

// Read the generated IDL.
const idl = JSON.parse(require('fs').readFileSync('./target/idl/cryptails.json', 'utf8'));

// Address of the deployed program.
const programId = new PublicKey(data.programId);

const program = new anchor.Program(idl, programId);

(async() => {
    const provider = anchor.Provider.local();

    const [cryptailsAccount, cryptailsAccountBump] = await PublicKey.findProgramAddress(
      [Buffer.from(data.mainSeed)],
      programId
    )

    const account = await program.account.cryptails.fetch(cryptailsAccount);

  for(let tokenAccountKey of account.tokenAccounts) {
    const cryptailAcc = await program.account.cryptail.fetch(tokenAccountKey);

    console.log(cryptailAcc.tokenAccount.toString())
    console.log(cryptailAcc.name)
    console.log(cryptailAcc.method)
  }
})()
