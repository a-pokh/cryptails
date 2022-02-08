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

  // get all token accounts in wallet by token program id
  const { value: walletTokenAccounts } = await provider.connection.getTokenAccountsByOwner(
    provider.wallet.publicKey, 
    { programId: spl.TOKEN_PROGRAM_ID }
  )

  const programAccounts = await provider.connection.getProgramAccounts(programId)

  // result list
  let listToShow = []

  // get list of all wallet token pubkes strings
  const walletTokenPubkeys = walletTokenAccounts.map(({pubkey}) => pubkey.toString())

  for(let programAccount of programAccounts) {
    // fetch specific cryptail account
    const cryptailAcc = await program.account.cryptail.fetch(programAccount.pubkey);

    // TODO: find out if such chek is secure
    // if this cryptail account belongs to user's wallet add it to result
    if(walletTokenPubkeys.includes(cryptailAcc.tokenAccount.toString())) {
      listToShow.push(cryptailAcc)
    }
  }

  for(let cryptailAcc of listToShow) {
    console.log(cryptailAcc)
  }
})()
