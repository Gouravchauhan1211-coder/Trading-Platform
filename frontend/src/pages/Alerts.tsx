import { useState } from 'react';
import { useAlertStore } from '../store';
import { Bell, Trash2, Check, AlertTriangle, Activity, Briefcase, Settings } from 'lucide-react';
import type { AlertType } from '../types';

type FilterType = 'ALL' | AlertType;

export default function Alerts() {
  const { alerts, filterType, setFilterType, removeAlert } = useAlertStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const filteredAlerts = filterType === 'ALL' 
    ? alerts 
    : alerts.filter(a => a.type === filterType);
  
  const getTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'PRICE':
        return <Bell className="text-primary-600" size={16} />;
      case 'INDICATOR':
        return <Activity className="text-signal-600" size={16} />;
      case 'STRATEGY':
        return <Check className="text-buy-600" size={16} />;
      case 'PORTFOLIO':
        return <Briefcase className="text-panel-600" size={16} />;
      case 'SYSTEM':
        return <Settings className="text-panel-600" size={16} />;
      default:
        return <Bell className="text-panel-600" size={16} />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-buy-100 text-buy-700';
      case 'TRIGGERED':
        return 'bg-alert-100 text-alert-700';
      case 'DISMISSED':
        return 'bg-panel-200 text-panel-600';
      default:
        return 'bg-panel-100 text-panel-600';
    }
  };
  
  const alertTypes: FilterType[] = ['ALL', 'PRICE', 'INDICATOR', 'STRATEGY', 'PORTFOLIO', 'SYSTEM'];
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-panel-900">Alerts</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          Create Alert
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {alertTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filterType === type
                ? 'bg-primary-100 text-primary-700'
                : 'bg-panel-100 text-panel-600 hover:bg-panel-200'
            }`}
          >
            {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      
      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className="card p-4 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-panel-50 rounded-lg">
                {getTypeIcon(alert.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-panel-900">
                    {alert.type === 'PRICE' && alert.symbol ? `${alert.symbol} Price Alert` : alert.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                </div>
                <div className="text-sm text-panel-600 mt-1">
                  {alert.symbol && <span className="font-medium">{alert.symbol} - </span>}
                  {alert.condition} {alert.value}
                </div>
                <div className="text-xs text-panel-500 mt-1">
                  Created: {new Date(alert.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <button
              onClick={() => removeAlert(alert.id)}
              className="p-2 hover:bg-sell-100 rounded-lg"
            >
              <Trash2 className="text-sell-600" size={18} />
            </button>
          </div>
        ))}
        
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <Bell className="mx-auto text-panel-400 mb-4" size={48} />
            <p className="text-panel-500">No alerts to display</p>
          </div>
        )}
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-panel-900">
            {alerts.filter(a => a.status === 'ACTIVE').length}
          </div>
          <div className="text-sm text-panel-500">Active</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-alert-700">
            {alerts.filter(a => a.status === 'TRIGGERED').length}
          </div>
          <div className="text-sm text-panel-500">Triggered</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-panel-600">
            {alerts.filter(a => a.status === 'DISMISSED').length}
          </div>
          <div className="text-sm text-panel-500">Dismissed</div>
        </div>
      </div>
    </div>
  );
}