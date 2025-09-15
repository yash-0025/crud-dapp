'use client'

// import { getCounterProgram, getCounterProgramId } from '@project/anchor'

import { getCrudProgram, getCrudProgramId, CrudIDL } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

interface CreateEntryArgs {
  title: string;
  message: string;
  owner: PublicKey;
}

export function useCounterProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  console.log("Cluster in use:", cluster.name, cluster.endpoint)

  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  // const programId = useMemo(() => getCrudProgramId(cluster.network as Cluster), [cluster])
  const programId = useMemo(() => 
    cluster.network === "custom" ? new PublicKey('31r13vR2Cpty7RiZh6ZmXq4uDH4SbRV9t7AzFBFvvPEY') :
     getCrudProgramId(cluster.network as Cluster), [cluster])
  console.log("Program Id :: ", programId)
  
  const program = useMemo(() => getCrudProgram(provider, programId), [provider, programId])
  console.log("Program  :: ", program)

  const accounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

 

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ['crud', 'create_journal_entry', {cluster}],
    mutationFn: async({title, message, owner}) => {
      const [journalEntryAddress] = PublicKey.findProgramAddressSync([
        Buffer.from(title), owner.toBuffer()
      ],
      programId
    )
    console.log("Journal Entry Address :: ", journalEntryAddress);
      return program.methods.createJournalEntry(title, message).rpc()
},
onSuccess: async(signature) => {
  transactionToast(signature);
  accounts.refetch();
},
onError: (error) => {
  toast.error(`Failed to create journal entry: ${error.message}`)
},


})

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry


  }
}

export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCounterProgram()
  const programId = useMemo(() => 
    cluster.network === "custom" ? new PublicKey('31r13vR2Cpty7RiZh6ZmXq4uDH4SbRV9t7AzFBFvvPEY') :
     getCrudProgramId(cluster.network as Cluster), [cluster])
     console.log("Program Id :: ", programId)

  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  })

  const updateEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ['crud', 'update_journal_entry', {cluster}],
    mutationFn: async({ title, message, owner}) => {
      const [journalEntryAddress] = PublicKey.findProgramAddressSync([Buffer.from(title), owner.toBuffer()],
      programId
    )
    return program.methods.updateJournalEntry(title,message).rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature)
      await accounts.refetch()
    },
    onError: () => {
      toast.error('Failed to update journal entry')
    },

  })

  const deleteEntry = useMutation({
    mutationKey: ['crud', 'delete_journal_entry', {cluster, account}],
    mutationFn: (title: string) => 
      program.methods.deleteJournalEntry(title).rpc(),
      onSuccess: (tx) => {
        transactionToast(tx);
        return accounts.refetch();
    },
  })
  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  }
  
}