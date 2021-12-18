const anchor = require('@project-serum/anchor');
const serumCmn = require("@project-serum/common");
const spl = require("@solana/spl-token");
const data = require('./data');

const { PublicKey, SystemProgram } = anchor.web3;
// Configure the client to use the local cluster.
anchor.setProvider(anchor.Provider.env());

// Read the generated IDL.
const idl = JSON.parse(require('fs').readFileSync('./target/idl/cryptails.json', 'utf8'));
const mpIdl = JSON.parse(require('fs').readFileSync('./target/idl/marketplace.json', 'utf8'));
const tIdl = JSON.parse(require('fs').readFileSync('./target/idl/transfer.json', 'utf8'));

// Address of the deployed program.
const programId = new PublicKey(data.programId);
const marketplaceProgramId = new PublicKey(data.marketplaceProgramId);
const tProgramId = new PublicKey("9vkSpJ1iaVn7STaGHnx2r4iaYjYqiGH4aYiy5RFPpr4g");

const program = new anchor.Program(idl, programId);
const mpProgram = new anchor.Program(mpIdl, marketplaceProgramId);
const tProgram = new anchor.Program(tIdl, tProgramId);

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
  //TODO: have some maps :)
  let keyList = []

  // get list of all wallet token pubkes strings
  const walletTokenPubkeys = walletTokenAccounts.map(({pubkey}) => pubkey.toString())

  for(let programAccount of programAccounts) {
    // fetch specific cryptail account
    const cryptailAcc = await program.account.cryptail.fetch(programAccount.pubkey);

    // TODO: find out if such chek is secure
    // if this cryptail account belongs to user's wallet add it to result
    if(walletTokenPubkeys.includes(cryptailAcc.tokenAccount.toString())) {
      listToShow.push(cryptailAcc)
      keyList.push(programAccount.pubkey)
    }
  }

  const index = 0
  const itemToSell = listToShow[index]
  const cryptailAccPubkey = keyList[index]
  const seed = itemToSell.name + "mp"
  console.log(seed)

  const [marketplaceItem, marketplaceItemBump] = await PublicKey.findProgramAddress(
    [Buffer.from(seed)],
    marketplaceProgramId,
  )

  const tx = await tProgram.rpc.sell(new anchor.BN(120), Buffer.from(seed), new anchor.BN(marketplaceItemBump), {
    accounts: {
      marketplaceItem,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: spl.TOKEN_PROGRAM_ID,
    },
    signers: [],
  });

  const mpProgramAccounts = await provider.connection.getProgramAccounts(programId)

  const mpAcc = await program.account.marketplace.fetch(marketplaceItem);
  console.log(mpAcc)


})()
