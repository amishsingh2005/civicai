import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MoreVertical, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';

const ComplaintTable = ({ complaints, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Recent Complaints</h2>
          <p className="text-slate-400 text-sm">Manage and track community issues</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or Location..." 
              className="bg-slate-950 border border-slate-800 rounded-2xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 w-full md:w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="bg-slate-950 border border-slate-800 rounded-2xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer pr-10"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236366f1\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Problem ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Progress</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredComplaints.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-800 shrink-0 shadow-sm">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <Link 
                      to={`/admin/issue/${item.id}`} 
                      target="_blank" 
                      className="text-indigo-400 hover:text-indigo-300 font-bold decoration-indigo-400/30 underline-offset-4 hover:underline"
                    >
                      {item.displayId || item.id}
                    </Link>

                  </div>
                </td>

                <td className="px-6 py-4 text-sm font-medium text-slate-200">{item.type}</td>
                <td className="px-6 py-4 text-sm text-slate-400 max-w-[180px] truncate" title={item.location}>
                  {item.location}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`font-semibold ${getSeverityColor(item.severity)} flex items-center gap-1.5`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.severity === 'High' ? 'bg-red-500' : item.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    {item.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4">
                  <ProgressBar progress={item.progress} status={item.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <select 
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer hover:border-indigo-500/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <button 
                      onClick={() => onUpdateStatus(item.id, 'Resolved')}
                      className={`p-2 rounded-xl transition-all ${item.status === 'Resolved' ? 'bg-green-500/20 text-green-500' : 'bg-slate-800 text-slate-400 hover:bg-green-500/10 hover:text-green-500'}`}
                      title="Mark as Resolved"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-slate-800 transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredComplaints.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <p>No complaints found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintTable;
