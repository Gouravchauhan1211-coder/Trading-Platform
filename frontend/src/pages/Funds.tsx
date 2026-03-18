import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, History, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import { fundsApi } from '../services/api';

interface WalletData {
  id: string;
  balance: number;
  lockedBalance: number;
  availableBalance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  reference: string;
  createdAt: string;
}

export default function Funds() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [walletData, txData] = await Promise.all([
        fundsApi.getWallet(),
        fundsApi.getTransactions(0, 20)
      ]);
      setWallet(walletData);
      setTransactions(txData.content || txData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    try {
      const result = await fundsApi.deposit(parseFloat(amount), 'razorpay');
      if (result.paymentLink) {
        window.location.href = result.paymentLink;
      }
      setShowDepositModal(false);
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to initiate deposit');
    }
  };

  const handleWithdraw = async () => {
    try {
      await fundsApi.withdraw(parseFloat(amount), 'default');
      setShowWithdrawModal(false);
      setAmount('');
      loadWalletData();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate withdrawal');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="text-buy-600" size={20} />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="text-sell-600" size={20} />;
      case 'TRADE':
        return <CreditCard className="text-primary-600" size={20} />;
      default:
        return <History className="text-panel-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-buy-600 bg-buy-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'FAILED':
        return 'text-sell-600 bg-sell-100';
      default:
        return 'text-panel-600 bg-panel-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-panel-900">Funds</h1>
        <button
          onClick={loadWalletData}
          className="p-2 hover:bg-panel-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={20} className="text-panel-600" />
        </button>
      </div>

      {error && (
        <div className="bg-sell-100 border border-sell-300 text-sell-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Wallet className="text-primary-600" size={20} />
            </div>
            <span className="text-panel-600 text-sm">Total Balance</span>
          </div>
          <div className="text-2xl font-bold text-panel-900">
            ₹{(wallet?.balance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Lock className="text-yellow-600" size={20} />
            </div>
            <span className="text-panel-600 text-sm">Locked Balance</span>
          </div>
          <div className="text-2xl font-bold text-panel-900">
            ₹{(wallet?.lockedBalance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-buy-100 rounded-lg">
              <ArrowUpRight className="text-buy-600" size={20} />
            </div>
            <span className="text-panel-600 text-sm">Available Balance</span>
          </div>
          <div className="text-2xl font-bold text-buy-600">
            ₹{(wallet?.availableBalance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowDepositModal(true)}
          className="px-6 py-3 bg-buy-600 text-white rounded-lg hover:bg-buy-700 transition-colors flex items-center gap-2"
        >
          <ArrowDownLeft size={20} />
          Deposit Funds
        </button>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="px-6 py-3 bg-panel-200 text-panel-800 rounded-lg hover:bg-panel-300 transition-colors flex items-center gap-2"
        >
          <ArrowUpRight size={20} />
          Withdraw Funds
        </button>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="p-4 border-b border-panel-200">
          <h2 className="text-lg font-semibold text-panel-900">Transaction History</h2>
        </div>
        <div className="divide-y divide-panel-100">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-panel-500">
              No transactions found
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-panel-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-panel-100 rounded-lg">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <div className="font-medium text-panel-900">{tx.type}</div>
                    <div className="text-sm text-panel-500">{tx.reference}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${
                    tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'text-buy-600' : 'text-sell-600'
                  }`}>
                    {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-panel-900 mb-4">Deposit Funds</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-panel-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-panel-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter amount"
                  min="100"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 px-4 py-2 border border-panel-300 rounded-lg hover:bg-panel-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={!amount || parseFloat(amount) < 100}
                  className="flex-1 px-4 py-2 bg-buy-600 text-white rounded-lg hover:bg-buy-700 disabled:opacity-50"
                >
                  Proceed to Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-panel-900 mb-4">Withdraw Funds</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-panel-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-panel-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter amount"
                  min="100"
                  max={wallet?.availableBalance}
                />
              </div>
              <p className="text-sm text-panel-500">
                Available: ₹{(wallet?.availableBalance || 0).toLocaleString('en-IN')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-2 border border-panel-300 rounded-lg hover:bg-panel-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={!amount || parseFloat(amount) < 100 || parseFloat(amount) > (wallet?.availableBalance || 0)}
                  className="flex-1 px-4 py-2 bg-panel-800 text-white rounded-lg hover:bg-panel-900 disabled:opacity-50"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
