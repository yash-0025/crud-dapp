#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("31r13vR2Cpty7RiZh6ZmXq4uDH4SbRV9t7AzFBFvvPEY");

#[program]
pub mod crud {
    use super::*;

    pub fn create_journal_entry(ctx: Context<CreateEntry>, title: String, message: String) -> Result<()> {

        msg!("Journal Entry Created!");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let journal_account = &mut ctx.accounts.journal_account;
        journal_account.owner = ctx.accounts.owner.key();
        journal_account.title = title;
        journal_account.message = message;

        Ok(())
    }

    pub fn update_journal_entry(ctx: Context<UpdateEntry>, title: String, message: String) -> Result<()> {

        msg!("Journal Entry Updated!");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let journal_account = &mut ctx.accounts.journal_account;
        journal_account.message = message;

        Ok(())

    }


    pub fn delete_journal_entry(_ctx: Context<DeleteEntry>, title: String) -> Result<()> {
        msg!("Journal Entry Deleted!");
        msg!("Title Deleted: {}", title);
        Ok(())
    }



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

#[derive(Accounts)]
#[instruction(title:String)]
pub struct UpdateEntry<'info> {
    #[account(
        mut,
        seeds= [title.as_bytes(), owner.key().as_ref()],
        bump,
        realloc = 8 + JournalEntryState::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = true
    )]
    pub journal_account: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title:String)]
pub struct DeleteEntry<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner,
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
    #[max_len(64)]
    pub title: String,
    #[max_len(256)]
    pub message: String,
}