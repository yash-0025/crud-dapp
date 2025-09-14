#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS");

#[program]
pub mod crud {
    use super::*;

    pub fn create_journal_entry(ctx: Context<CreateEntry>, title: String, message: String) -> Result<()> {
        let journal_account = &mut ctx.accounts.journal_account;
        journal_account.owner = ctx.accounts.owner.key();
        journal_account.title = title;
        journal_account.message = message;
        Ok(())
    }






#[derive(Accounts)]
#[instruction(title:String)]
pub struct CreateEntry<'info>  {
    #[account(
        init,
        payer = owner,
        space = 8 + JournalEntryState::INIT_SPACE,
        // space = 8 + 32 [Pubkey] + [4 + title.len()] + [4 + 256]
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
    )]
    pub journal_account: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,
    pub title: String,
    #[max_len(256)]
    pub message: String,
}

    
}
