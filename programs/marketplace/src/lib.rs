use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, TokenAccount};
use cryptails::Cryptail;

declare_id!("Azvt8NqEDCpNTWzwk8nLS8wrJSeq3XLVrFAvDo8eimZw");

#[program]
pub mod marketplace {
    use super::*;
    pub fn sell(
        ctx: Context<Sell>, 
        price: u64,
        _seed: String, 
        _bump: u8,
    ) -> ProgramResult {
        token::transfer(ctx.accounts.into_transfer_context(), 1)?;
        
        let marketplace_item = &mut ctx.accounts.marketplace_item;
        marketplace_item.cryptail_account = *ctx.accounts.cryptail.to_account_info().key;
        marketplace_item.seller_account = *ctx.accounts.user.to_account_info().key;
        marketplace_item.buyer_account = None;
        marketplace_item.start_sell_at = 0;
        marketplace_item.bought_at = 0;
        marketplace_item.price = price;

        // update Cryptail with actual info: current token account

        Ok(())
    }

    pub fn buy(ctx: Context<Buy>) -> ProgramResult {
        let marketplace_item = &mut ctx.accounts.marketplace_item;

        // transfer SOL
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &marketplace_item.key(),
            marketplace_item.price,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                marketplace_item.to_account_info(),
            ],
        )?;
        
        marketplace_item.buyer_account = None;
        marketplace_item.bought_at = 0;

        // send SOL to seller
        // send token to buyer
        // update Cryptail with actual info: current token account and new owner

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(price: u64, seed: String, bump: u8)]
pub struct Sell<'info> {
    // create new marketplace item on sell
    #[account(
        init, 
        // TODO: seed should be unique per sell, should contain more than name
        seeds = [seed.as_bytes()],
        bump = bump,
        payer = user,
        space = 2048
    )]
    pub marketplace_item: Account<'info, MarketplaceItem>,
    #[account(mut)]
    pub seller_token_account: Box<Account<'info, TokenAccount>>,
    // marketplace should have token account for specific account to store it
    // TODO: init it here
    #[account(mut)]
    pub mp_token_account: Box<Account<'info, TokenAccount>>,
    pub cryptail: Account<'info, Cryptail>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: AccountInfo<'info>,
}

impl<'info> Sell<'info> {
    fn into_transfer_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.seller_token_account.to_account_info(),
            to: self.mp_token_account.to_account_info(),
            authority: self.user.to_account_info(),
        };
        CpiContext::new(
            self.token_program.clone(), 
            cpi_accounts, 
        )
    }
}

#[derive(Accounts)]
pub struct Buy<'info> {
    // item account
    #[account(mut)]
    pub marketplace_item: Account<'info, MarketplaceItem>,
    // buyer token account
    #[account(mut)]
    pub buyer_token_account: Box<Account<'info, TokenAccount>>,
    // mp token account
    #[account(mut)]
    pub mp_token_account: Box<Account<'info, TokenAccount>>,
    pub cryptail: Account<'info, Cryptail>,
    // buyer
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: AccountInfo<'info>,
}

#[account]
pub struct MarketplaceItem {
    // cryptail account
    pub cryptail_account: Pubkey,
    pub seller_account: Pubkey,
    pub buyer_account: Option<Pubkey>,
    pub start_sell_at: u64,
    pub bought_at: u64,
    pub price: u64,
}
