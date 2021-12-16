const anchor = require('@project-serum/anchor');

const data = require('./data');

const { PublicKey, SystemProgram } = anchor.web3;
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

    console.log("init")
    // as init_if_needed works weird - dispatch init only once and separately for now
    const txInit = await program.rpc.init(Buffer.from(data.mainSeed), new anchor.BN(cryptailsAccountBump), {
      accounts: {
        cryptails: cryptailsAccount,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [],
    });
})()
