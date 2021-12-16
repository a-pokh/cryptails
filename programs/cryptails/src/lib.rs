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
        bump: u8,
    ) -> ProgramResult {
        let nn = name.clone();
        let bb = bump;
        // TODO: use cryptails account state data
        let seeds = [nn.as_bytes(), &[bb]];
        let signer = &[&seeds[..]];

        token::mint_to(ctx.accounts.into_mint_to_context().with_signer(signer), 1)?;
        token::set_authority(
            ctx.accounts.into_set_authority_context().with_signer(signer),
            AuthorityType::MintTokens,
            None,
        )?;

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
#[instruction(name: String, bump: u8)]
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
    pub token_account: Pubkey,
    pub name: String,
    pub ingridients: String,
    pub method: String,
    pub photo: String,
    pub experience: u32,
}
