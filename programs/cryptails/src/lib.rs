use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo, TokenAccount};

declare_id!("CELEWojrkyqTYFqkevnTQi6rtLwwSMTbRc5vZAy2KwPc");

#[program]
pub mod cryptails {
    use super::*;

    pub fn init(ctx: Context<Init>, seed: String, bump: u8) -> ProgramResult {
        let cryptails = &mut ctx.accounts.cryptails;
        cryptails.seed = seed;
        cryptails.bump = bump;

        Ok(())
    }

    pub fn create(
        ctx: Context<Create>, 
        name: String,
        _bump: u8,
    ) -> ProgramResult {
        let cryptails = &mut ctx.accounts.cryptails;
        cryptails
            .token_accounts
            .push(*ctx.accounts.cryptail.to_account_info().key);

        let seeds = ["cryptails_acc".as_bytes(), &[254]];
        let signer = &[&seeds[..]];

        token::mint_to(ctx.accounts.into_mint_to_context().with_signer(signer), 1)?;

        let cryptail = &mut ctx.accounts.cryptail;
        cryptail.token_account = *ctx.accounts.token_account.to_account_info().key;
        cryptail.name = name.clone();
        cryptail.ingridients = name.clone();
        cryptail.method = name;
        cryptail.experience = 0;
     
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(seed: String, bump: u8)]
pub struct Init<'info> {
#[account(
    init, 
    seeds = [seed.as_bytes()],
    bump = bump,
    payer = user, 
    space = 2048
)]
pub cryptails: Account<'info, Cryptails>,
pub user: Signer<'info>,
pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, bump: u8)]
pub struct Create<'info> {
#[account(mut)]
pub cryptails: Account<'info, Cryptails>,
#[account(
    init, 
    seeds = [name.as_bytes()],
    bump = bump,
    payer = user,
    space = 2048
)]
pub cryptail: Account<'info, Cryptail>,
#[account(mut)]
pub token_account: Box<Account<'info, TokenAccount>>,
#[account(mut)]
pub mint: AccountInfo<'info>,
#[account(mut)]
pub user: Signer<'info>,
pub system_program: Program<'info, System>,
pub token_program: AccountInfo<'info>,
pub rent: Sysvar<'info, Rent>,
}

impl<'info> Create<'info> {
    fn into_mint_to_context(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.mint.to_account_info().clone(),
            to: self.token_account.to_account_info().clone(),
            authority: self.cryptails.to_account_info().clone(),
        };
        CpiContext::new(
            self.token_program.clone(), 
            cpi_accounts, 
        )
    }
}

#[account]
pub struct Cryptails {
    pub token_accounts: Vec<Pubkey>,
    pub seed: String,
    pub bump: u8,
}

#[account]
pub struct Cryptail {
    pub token_account: Pubkey,
    pub name: String,
    pub ingridients: String,
    pub method: String,
    pub photo: String,
    pub experience: u32,
}
