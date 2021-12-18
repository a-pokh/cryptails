const anchor = require('@project-serum/anchor');
const spl = require("@solana/spl-token");
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

  const programAccounts = await provider.connection.getProgramAccounts(programId)

  // result list
  let listToShow = []

  for(let programAccount of programAccounts) {
    // fetch specific cryptail account
    const cryptailAcc = await program.account.cryptail.fetch(programAccount.pubkey);

    listToShow.push(cryptailAcc)
  }

  for(let tokenAccount of listToShow) {
    console.log(tokenAccount.tokenMintAccount.toString())
  }
})()
