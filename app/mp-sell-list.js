const anchor = require('@project-serum/anchor');
const spl = require("@solana/spl-token");
const data = require('./data');

const { PublicKey } = anchor.web3;
// Configure the client to use the local cluster.
anchor.setProvider(anchor.Provider.env());

// Read the generated IDL.
const idl = JSON.parse(require('fs').readFileSync('./target/idl/marketplace.json', 'utf8'));

// Address of the deployed program.
const programId = new PublicKey(data.marketplaceProgramId);

const program = new anchor.Program(idl, programId);

(async() => {
  const provider = anchor.Provider.local();

  const programAccounts = await provider.connection.getProgramAccounts(programId)

  // result list
  let allItemsAccounts = []
  let userItemsAccounts = []

  for(let programAccount of programAccounts) {
    // fetch specific cryptail account
    const mpAcc = await program.account.marketplaceItem.fetch(programAccount.pubkey);

    allItemsAccounts.push(mpAcc)

    if(mpAcc.seller.toString() === provider.wallet.publicKey.toString()) {
      userItemsAccounts.push(mpAcc)
    }

  }

  console.log("all accounts to sell:")
  for(let acc of allItemsAccounts) {
    console.log(acc)
  }

  console.log("user accounts to sell:")
  for(let acc of userItemsAccounts) {
    console.log("name: " + acc.name.toString())
    console.log("price: " + acc.price.toString())
    console.log("mint acc: " + acc.tokenMintAccount.toString())
    console.log("token acc: " + acc.tokenAccount.toString())
    console.log("seller: " + acc.seller.toString())
  }
})()
