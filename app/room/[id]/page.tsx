'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@/components/WalletProvider';
import WalletConnect from '@/components/WalletConnect';
import { CONTRACT_ID, RPC_URL, NETWORK_PASSPHRASE } from '@/components/config';
import { rpc, Contract, nativeToScVal, scValToNative, TransactionBuilder, Account, Keypair } from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

export default function RoomPage() {
  const { id } = useParams() as { id: string };
  const pollId = parseInt(id);
  const router = useRouter();
  
  const { address } = useWallet();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [votingOptionId, setVotingOptionId] = useState<number | null>(null);

  const server = new rpc.Server(RPC_URL);
  const contract = new Contract(CONTRACT_ID);

  const fetchState = async () => {
    try {
      if (isNaN(pollId)) {
        setError('Invalid Room Code');
        setLoading(false);
        return;
      }
      
      const pollReqTx = new TransactionBuilder(new Account(address || Keypair.random().publicKey(), "0"), { fee: '100', networkPassphrase: NETWORK_PASSPHRASE })
        .addOperation(contract.call('get_poll', nativeToScVal(pollId, { type: 'u32' })))
        .setTimeout(30)
        .build();
        
      const pollSim = await server.simulateTransaction(pollReqTx);
      
      if (!rpc.Api.isSimulationSuccess(pollSim) || !pollSim.result?.retval) {
         setError('Room not found on-chain');
         setLoading(false);
         return;
      }

      // get_poll returns (PollData, Map<u32, u32>)
      // PollData is a tuple/struct: [creator, question, options]
      const results = scValToNative(pollSim.result.retval);
      const pollData = results[0];
      const voteMap = results[1] || {};

      setQuestion(pollData.question);
      setOptions(pollData.options);

      const parsedVotes: Record<number, number> = {};
      for (const [key, val] of Object.entries(voteMap) as any) {
        parsedVotes[key] = Number(val);
      }
      setVotes(parsedVotes);

      // Fetch has_voted if user is connected
      if (address) {
        const hasVotedTx = new TransactionBuilder(new Account(address, "0"), { fee: '100', networkPassphrase: NETWORK_PASSPHRASE })
          .addOperation(contract.call('has_voted', nativeToScVal(pollId, { type: 'u32' }), nativeToScVal(address, { type: 'address' })))
          .setTimeout(30)
          .build();
          
        const hasVotedSim = await server.simulateTransaction(hasVotedTx);
        if (rpc.Api.isSimulationSuccess(hasVotedSim) && hasVotedSim.result?.retval) {
           setHasVoted(scValToNative(hasVotedSim.result.retval));
        }
      }
      
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError('Failed to load room data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    // Poll for updates every 5 seconds
    const interval = setInterval(() => fetchState(), 5000);
    return () => clearInterval(interval);
  }, [address, id]);

  const castVote = async (optionIndex: number) => {
    if (!address) return;
    try {
      setVotingOptionId(optionIndex);
      
      const sourceAccount = await server.getAccount(address);
      const tx = new TransactionBuilder(sourceAccount, {
        fee: '1500',
        networkPassphrase: NETWORK_PASSPHRASE
      })
      .addOperation(contract.call('vote', 
        nativeToScVal(address, { type: 'address' }),
        nativeToScVal(pollId, { type: 'u32' }),
        nativeToScVal(optionIndex, { type: 'u32' })
      ))
      .setTimeout(60)
      .build();

      const preparedTransaction = await server.prepareTransaction(tx);
      const signedXdr = await signTransaction(preparedTransaction.toXDR(), { networkPassphrase: NETWORK_PASSPHRASE });
      if (signedXdr.error) throw new Error(signedXdr.error as string);
      
      const signedTx = TransactionBuilder.fromXDR(signedXdr.signedTxXdr as string, NETWORK_PASSPHRASE);
      const sendResult = await server.sendTransaction(signedTx as any);
      
      if (sendResult.status === 'ERROR') throw new Error('Transaction rejected');

      let status = await server.getTransaction(sendResult.hash);
      while (status.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
        await new Promise(r => setTimeout(r, 1000));
        status = await server.getTransaction(sendResult.hash);
      }

      if (status.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        setHasVoted(true);
        setVotes(v => ({ ...v, [optionIndex]: (v[optionIndex] || 0) + 1 }));
      } else {
        alert('Transaction failed on-chain');
      }
    } catch (e: any) {
      console.error(e);
      alert('Error casting vote: ' + e.message);
    } finally {
      setVotingOptionId(null);
    }
  };

  // Calculate percentages for leaderboard
  const totalVotes = Object.values(votes).reduce((acc, curr) => acc + curr, 0);

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-gray-900 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-gray-900/80 to-gray-900" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      
      <div className="relative w-full max-w-lg z-10 flex flex-col pt-12 pb-12">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => router.push('/')}
            className="text-purple-300 hover:text-white flex items-center gap-2 font-medium"
          >
            ← Back to Home
          </button>
          <WalletConnect />
        </div>

        {error ? (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 text-center text-white backdrop-blur-md">
            <p className="text-xl font-bold mb-2">Oops!</p>
            <p className="text-red-200">{error}</p>
          </div>
        ) : loading && !question ? (
          <div className="flex justify-center my-12">
            <span className="w-10 h-10 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin"></span>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-[30px] rounded-2xl p-6 border border-white/20 shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(168,85,247,0.15)] flex flex-col items-center">
            <span className="bg-purple-500/20 text-purple-300 text-sm font-bold px-3 py-1 rounded-full border border-purple-500/30 mb-4">
              Room #{pollId}
            </span>
            <h1 className="text-3xl font-bold text-white text-center mb-8">{question}</h1>

            <div className="w-full space-y-4">
              {options.map((opt, i) => {
                const count = votes[i] || 0;
                const percentage = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                
                return (
                  <div key={i} className="relative overflow-hidden rounded-xl border border-white/10 hover:border-purple-400 bg-black/20 transition-all p-1">
                    {/* Background indicator for votes percent */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-purple-600/30 transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                    
                    <button
                      onClick={() => castVote(i)}
                      disabled={!address || hasVoted || votingOptionId !== null}
                      className="relative w-full text-left p-3 rounded-lg flex justify-between items-center z-10 disabled:cursor-not-allowed group"
                    >
                      <div className="flex gap-3 items-center w-full min-w-0 pr-4">
                        {votingOptionId === i && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300 shrink-0"></span>}
                        <span className="text-white font-medium truncate">{opt}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        {hasVoted && (
                          <span className="text-xs text-purple-200">{percentage}%</span>
                        )}
                        <span className="text-purple-300 bg-purple-900/80 px-3 py-1 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                          {count}
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {!address && (
              <p className="text-center text-sm text-purple-300/80 mt-6">
                Connect your wallet to participate.
              </p>
            )}
            {hasVoted && (
              <div className="text-center mt-6">
                <p className="inline-block text-sm text-green-400 font-semibold bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                  🎉 Vote recorded successfully!
                </p>
                <p className="text-xs text-purple-300 mt-2 opacity-80">Leaderboard updates automatically.</p>
              </div>
            )}
            
            <p className="text-xs mt-8 opacity-40 text-white w-full text-center">
              Total Votes Cast: {totalVotes}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
