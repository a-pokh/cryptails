use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo, TokenAccount};

declare_id!("73v77cSsjHeZPoJQteYfphXTiqLWpHDHnnpm87TPJPzn");

#[program]
pub mod cryptails {
    use super::*;

    pub fn create(ctx: Context<Create>, name: String) -> ProgramResult {
        let cryptails = &mut ctx.accounts.cryptails;
        let (token_account_pubkey, _token_account_bump_seed) =
            Pubkey::find_program_address(&[(name + "token").as_bytes()], ctx.program_id);
        cryptails
            .token_accounts
            .push(*ctx.accounts.token_account.to_account_info().key);

        token::mint_to(ctx.accounts.into_mint_to_context(), 1)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer = user, space = 8 + 40)]
    pub cryptails: Account<'info, Cryptails>,
    #[account(
        init,
        payer = user,
        token::mint = mint,
        token::authority = user,
    )]
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
            authority: self.user.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}

#[account]
pub struct Cryptails {
    pub token_accounts: Vec<Pubkey>,
}
