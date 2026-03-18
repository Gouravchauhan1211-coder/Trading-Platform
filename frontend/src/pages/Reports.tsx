import { useState, useEffect } from 'react';
import { FileText, Download, Plus, Trash2, RefreshCw, AlertCircle, Loader } from 'lucide-react';
import { reportApi } from '../services/api';

interface Report {
  id: string;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  startDate: string;
  endDate: string;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReport, setNewReport] = useState({
    type: 'TRADE_SUMMARY',
    startDate: '',
    endDate: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportApi.getReports();
      setReports(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      setCreating(true);
      await reportApi.createReport(newReport.type, newReport.startDate, newReport.endDate);
      setShowCreateModal(false);
      setNewReport({ type: 'TRADE_SUMMARY', startDate: '', endDate: '' });
      loadReports();
    } catch (err: any) {
      setError(err.message || 'Failed to create report');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const blob = await reportApi.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to download report');
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      await reportApi.deleteReport(reportId);
      loadReports();
    } catch (err: any) {
      setError(err.message || 'Failed to delete report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-buy-600 bg-buy-100';
      case 'PROCESSING':
        return 'text-yellow-600 bg-yellow-100';
      case 'PENDING':
        return 'text-blue-600 bg-blue-100';
      case 'FAILED':
        return 'text-sell-600 bg-sell-100';
      default:
        return 'text-panel-600 bg-panel-100';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'TRADE_SUMMARY':
        return 'Trade Summary';
      case 'PORTFOLIO':
        return 'Portfolio Report';
      case 'TAX':
        return 'Tax Report';
      case 'PERFORMANCE':
        return 'Performance Report';
      default:
        return type;
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
        <h1 className="text-2xl font-bold text-panel-900">Reports</h1>
        <div className="flex gap-2">
          <button
            onClick={loadReports}
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
            Generate Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-sell-100 border border-sell-300 text-sell-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Reports Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-panel-50">
            <tr>
              <th className="text-left px-4 py-3 text-panel-600 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-panel-600 font-medium">Period</th>
              <th className="text-center px-4 py-3 text-panel-600 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-panel-600 font-medium">Created</th>
              <th className="text-center px-4 py-3 text-panel-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-100">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-panel-500">
                  <FileText size={48} className="mx-auto text-panel-400 mb-4" />
                  <p>No reports generated yet</p>
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-panel-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-panel-500" />
                      <span className="font-medium text-panel-900">{getTypeName(report.type)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-panel-600">
                    {new Date(report.startDate).toLocaleDateString('en-IN')} - {new Date(report.endDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status === 'PROCESSING' && <Loader size={12} className="inline animate-spin mr-1" />}
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-panel-600">
                    {new Date(report.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {report.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleDownload(report.id)}
                          className="p-2 hover:bg-buy-100 rounded transition-colors"
                          title="Download"
                        >
                          <Download size={16} className="text-buy-600" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-2 hover:bg-sell-100 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-sell-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-panel-900 mb-4">Generate Report</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-panel-700 mb-1">
                  Report Type
                </label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                  className="w-full px-4 py-2 border border-panel-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="TRADE_SUMMARY">Trade Summary</option>
                  <option value="PORTFOLIO">Portfolio Report</option>
                  <option value="TAX">Tax Report</option>
                  <option value="PERFORMANCE">Performance Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-panel-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newReport.startDate}
                  onChange={(e) => setNewReport({ ...newReport, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-panel-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-panel-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={newReport.endDate}
                  onChange={(e) => setNewReport({ ...newReport, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-panel-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-panel-300 rounded-lg hover:bg-panel-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReport}
                  disabled={!newReport.startDate || !newReport.endDate || creating}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating && <Loader size={16} className="animate-spin" />}
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
