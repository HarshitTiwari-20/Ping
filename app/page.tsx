'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import WalletConnect from '@/components/WalletConnect';
import { useWallet } from '@/components/WalletProvider';
import { 
  rpc, 
  Contract, 
  nativeToScVal,
  TransactionBuilder,
  xdr
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';
import { CONTRACT_ID, RPC_URL, NETWORK_PASSPHRASE } from '@/components/config';

export default function Home() {
  const router = useRouter();
  const { address } = useWallet();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('join');
  
  // Join State
  const [joinCode, setJoinCode] = useState('');

  // Create State
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [isCreating, setIsCreating] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim().length >= 4) {
      router.push(`/room/${joinCode.trim()}`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return alert('Connect wallet first');
    
    const validOptions = options.filter(o => o.trim().length > 0);
    if (validOptions.length < 2) return alert('Need at least 2 options');
    if (!question.trim()) return alert('Need a question');

    try {
      setIsCreating(true);
      const server = new rpc.Server(RPC_URL);
      const contract = new Contract(CONTRACT_ID);
      const sourceAccount = await server.getAccount(address);

      // Generate random 4 digit room code (1000 - 9999)
      const pollId = Math.floor(1000 + Math.random() * 9000);

      const tx = new TransactionBuilder(sourceAccount, {
        fee: '1500',
        networkPassphrase: NETWORK_PASSPHRASE
      })
      .addOperation(contract.call('create_poll', 
        nativeToScVal(address, { type: 'address' }),
        nativeToScVal(pollId, { type: 'u32' }),
        nativeToScVal(question, { type: 'string' }),
        xdr.ScVal.scvVec(validOptions.map(opt => xdr.ScVal.scvString(opt)))
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
        await new Promise(r => setTimeout(r, 1500));
        status = await server.getTransaction(sendResult.hash);
      }

      if (status.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        router.push(`/room/${pollId}`);
      } else {
        throw new Error('Transaction failed on-chain');
      }

    } catch (err: any) {
      console.error(err);
      alert('Error creating poll: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-gray-900 px-4">
      {/* Background with absolute positioning */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-gray-900/80 to-gray-900" />
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      {/* Main Content inside a relatively positioned container to sit above background */}
      <div className="relative w-full max-w-lg z-10 flex flex-col pt-12">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-white tracking-tight">
              Ping
            </h1>
          </div>
          <WalletConnect />
        </div>

        <div className="bg-white/10 backdrop-blur-[30px] rounded-2xl p-6 border border-white/20 shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(168,85,247,0.15)]">
          <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'join' ? 'bg-purple-500 text-white shadow-lg' : 'text-purple-200 hover:text-white'}`}
            >
              Join Room
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'create' ? 'bg-purple-500 text-white shadow-lg' : 'text-purple-200 hover:text-white'}`}
            >
              Create Room
            </button>
          </div>

          {activeTab === 'join' ? (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Room Code</label>
                <input 
                  type="text" 
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  placeholder="e.g. 4028"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button 
                type="submit"
                disabled={!joinCode.trim()}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-purple-400"
              >
                Join Poll
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">Question</label>
                <input 
                  type="text" 
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="What's your favorite color?"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-purple-200 mb-1">Options</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="text" 
                      value={opt}
                      onChange={e => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {options.length > 2 && (
                       <button
                         type="button"
                         onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                         className="p-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/40"
                       >
                         ✕
                       </button>
                    )}
                  </div>
                ))}
                
                {options.length < 8 && (
                  <button 
                    type="button" 
                    onClick={() => setOptions([...options, ''])}
                    className="text-sm text-purple-300 hover:text-white mt-2"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <button 
                type="submit"
                disabled={!address || isCreating}
                className="w-full mt-4 py-3 rounded-xl flex justify-center items-center bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                {isCreating ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : !address ? (
                  "Connect Wallet to Create"
                ) : (
                  "Launch Poll"
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}
