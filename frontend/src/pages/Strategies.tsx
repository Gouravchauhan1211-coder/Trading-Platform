import { useState, useEffect } from 'react';
import { Cpu, Play, Pause, Plus, Trash2, RefreshCw, AlertCircle, Settings } from 'lucide-react';
import { strategyApi } from '../services/api';

interface Strategy {
  id: string;
  name: string;
  type: string;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  config: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export default function Strategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    type: 'momentum',
    config: {}
  });

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await strategyApi.getStrategies();
      setStrategies(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load strategies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStrategy = async () => {
    try {
      await strategyApi.createStrategy(newStrategy);
      setShowCreateModal(false);
      setNewStrategy({ name: '', type: 'momentum', config: {} });
      loadStrategies();
    } catch (err: any) {
      setError(err.message || 'Failed to create strategy');
    }
  };

  const handleStartStrategy = async (id: string) => {
    try {
      await strategyApi.startStrategy(id);
      loadStrategies();
    } catch (err: any) {
      setError(err.message || 'Failed to start strategy');
    }
  };

  const handleStopStrategy = async (id: string) => {
    try {
      await strategyApi.stopStrategy(id);
      loadStrategies();
    } catch (err: any) {
      setError(err.message || 'Failed to stop strategy');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-buy-600 bg-buy-100';
      case 'PAUSED':
        return 'text-yellow-600 bg-yellow-100';
      case 'STOPPED':
        return 'text-panel-600 bg-panel-100';
      default:
        return 'text-panel-600 bg-panel-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="w-2 h-2 bg-buy-600 rounded-full animate-pulse"></span>;
      case 'PAUSED':
        return <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>;
      default:
        return <span className="w-2 h-2 bg-panel-400 rounded-full"></span>;
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
        <h1 className="text-2xl font-bold text-panel-900">Strategies</h1>
        <div className="flex gap-2">
          <button
            onClick={loadStrategies}
            className="p-2 hover:bg-panel-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className="text-panel-600" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Create Strategy
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-sell-100 border border-sell-300 text-sell-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategies.length === 0 ? (
          <div className="col-span-full card p-8 text-center">
            <Cpu size={48} className="mx-auto text-panel-400 mb-4" />
            <h3 className="text-lg font-medium text-panel-900 mb-2">No Strategies Yet</h3>
            <p className="text-panel-500 mb-4">Create your first trading strategy to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Strategy
            </button>
          </div>
        ) : (
          strategies.map((strategy) => (
            <div key={strategy.id} className="card p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Cpu size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-panel-900">{strategy.name}</h3>
                    <p className="text-sm text-panel-500">{strategy.type}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(strategy.status)}`}>
                  {getStatusIcon(strategy.status)}
                  {strategy.status}
                </span>
              </div>

              <div className="text-sm text-panel-500 mb-4">
                Created: {new Date(strategy.createdAt).toLocaleDateString('en-IN')}
              </div>

              <div className="flex gap-2">
                {strategy.status === 'STOPPED' || strategy.status === 'PAUSED' ? (
                  <button
                    onClick={() => handleStartStrategy(strategy.id)}
                    className="flex-1 px-3 py-2 bg-buy-600 text-white rounded-lg hover:bg-buy-700 flex items-center justify-center gap-2 text-sm"
                  >
                    <Play size={16} />
                    Start
                  </button>
                ) : (
                  <button
                    onClick={() => handleStopStrategy(strategy.id)}
                    className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2 text-sm"
                  >
                    <Pause size={16} />
                    Pause
                  </button>
                )}
                <button
                  className="p-2 border border-panel-300 rounded-lg hover:bg-panel-50"
                  title="Settings"
                >
                  <Settings size={16} className="text-panel-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Strategy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-panel-900 mb-4">Create New Strategy</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-panel-700 mb-1">
                  Strategy Name
                </label>
                <input
                  type="text"
                  value={newStrategy.name}
                  onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                  className="w-full px-4 py-2 border border-panel-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter strategy name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-panel-700 mb-1">
                  Strategy Type
                </label>
                <select
                  value={newStrategy.type}
                  onChange={(e) => setNewStrategy({ ...newStrategy, type: e.target.value })}
                  className="w-full px-4 py-2 border border-panel-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="momentum">Momentum</option>
                  <option value="mean-reversion">Mean Reversion</option>
                  <option value="breakout">Breakout</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-panel-300 rounded-lg hover:bg-panel-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStrategy}
                  disabled={!newStrategy.name}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
