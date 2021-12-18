use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Transfer};

declare_id!("9vkSpJ1iaVn7STaGHnx2r4iaYjYqiGH4aYiy5RFPpr4g");

#[program]
pub mod transfer {
    use super::*;
    pub fn sell(ctx: Context<Sell>, price: u64, seed: String, bump: u8) -> ProgramResult {
        msg!("heyy");

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.marketplace_item.key(),
            12000000,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.marketplace_item.to_account_info(),
            ],
        )?;

        //token::transfer(ctx.accounts.into_transfer_context(), 100)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Sell<'info> {
    #[account(mut)]
    pub marketplace_item: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: AccountInfo<'info>,
}

impl<'info> Sell<'info> {
    fn into_transfer_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.user.to_account_info(),
            to: self.user.to_account_info(),
            authority: self.user.to_account_info(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}
