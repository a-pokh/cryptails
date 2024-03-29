use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo, SetAuthority, TokenAccount};
use spl_token::instruction::AuthorityType;

declare_id!("CELEWojrkyqTYFqkevnTQi6rtLwwSMTbRc5vZAy2KwPc");

#[program]
pub mod cryptails {
    use super::*;

    pub fn create(
        ctx: Context<Create>, 
        name: String,
        ingridients: String,
        method: String,
        bump: u8,
    ) -> ProgramResult {
        // create PDA signer
        let seeds = [name.as_bytes(), &[bump]];
        let signer = &[&seeds[..]];
        // mint to user's token account and sign with cryptail PDA
        token::mint_to(ctx.accounts.into_mint_to_context().with_signer(signer), 1)?;
        // set authority to None to prevent new mint
        token::set_authority(
            ctx.accounts.into_set_authority_context().with_signer(signer),
            AuthorityType::MintTokens,
            None,
        )?;

        // save token data
        let cryptail = &mut ctx.accounts.cryptail;
        cryptail.token_mint_account = *ctx.accounts.mint.to_account_info().key;
        cryptail.token_account = *ctx.accounts.token_account.to_account_info().key;
        cryptail.owner_account = *ctx.accounts.user.to_account_info().key;
        cryptail.name = name;
        cryptail.ingridients = ingridients;
        cryptail.method = method;
        cryptail.experience = 0;
     
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, ingridients: String, method: String, bump: u8)]
pub struct Create<'info> {
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
            authority: self.cryptail.to_account_info().clone(),
        };
        CpiContext::new(
            self.token_program.clone(), 
            cpi_accounts, 
        )
    }

    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.mint.to_account_info().clone(),
            current_authority: self.cryptail.to_account_info().clone(),
        };
        CpiContext::new(
            self.token_program.clone(), 
            cpi_accounts, 
        )
    }
}

#[account]
pub struct Cryptail {
    // keep token mint account to create new token account on its base
    pub token_mint_account: Pubkey,
    // current token account where token exists. changes on buy/sell
    // when sell - it is exists on marketplace side 
    pub token_account: Pubkey,
    // account of current owner. changes on buy
    pub owner_account: Pubkey,
    pub name: String,
    pub ingridients: String,
    pub method: String,
    pub photo: String,
    pub experience: u32,
}
