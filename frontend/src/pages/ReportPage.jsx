import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, ArrowBigUp, ArrowBigDown, Clock, AlertCircle, Share2, MoreHorizontal, ShieldCheck, CheckCircle2, User, Building2, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import reportApi from '../api/reports';
import Comments from '../components/Comments';

const BACKEND_URL = 'http://localhost:8000';

const VerticalStatusTracker = ({ currentStatus }) => {
  const steps = [
    { label: 'Reported', status: 'Open', desc: 'Issue has been reported.' },
    { label: 'Verified', status: 'In Progress', desc: 'Authority has verified the issue.' },
    { label: 'In Progress', status: 'Working', desc: 'Work is currently underway.' },
    { label: 'Resolved', status: 'Resolved', desc: 'Issue has been successfully fixed.' }
  ];

  const getStepIndex = (s) => {
    if (s === 'Open') return 0;
    if (s === 'In Progress') return 1;
    if (s === 'Resolved') return 3;
    return 0;
  };
  
  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-800"></div>
      {steps.map((step, idx) => {
        const isActive = idx <= currentIndex;
        const isCurrent = idx === currentIndex;
        
        return (
          <div key={idx} className="flex gap-4 items-start relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-[#0B0F19] transition-all duration-500 ${isActive ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-800 text-slate-500'}`}>
              {idx === 0 ? <AlertCircle size={16} /> : 
               idx === 1 ? <ShieldCheck size={16} /> : 
               idx === 2 ? <Clock size={16} /> : <CheckCircle2 size={16} />}
            </div>
            <div className="flex flex-col pt-1">
              <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.label}</span>
              <span className="text-[11px] text-slate-400">{step.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(null);

  const fetchReport = async () => {
    try {
      const data = await reportApi.getPostById(id);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleVote = async (type) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      const voteValue = type === 'up' ? 1 : -1;
      const result = await reportApi.vote({
        report_id: id,
        user_id: user.user_id,
        vote_type: voteValue
      });
      setReport({ ...report, score: result.new_score });
      setUserVote(type);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (!report) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Report Not Found</h2>
      <p className="text-[var(--text-secondary)] mb-6">The report you're looking for might have been removed or doesn't exist.</p>
      <button onClick={() => navigate('/')} className="btn-primary px-6 py-2 rounded-full">Back to Feed</button>
    </div>
  );

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="w-full flex-1 flex justify-center py-6 px-4 bg-[#0B0F19]">
      <div className="w-full max-w-5xl flex flex-col">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors mb-8 self-start group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-xs uppercase tracking-widest">Feed</span>
        </button>

        {/* Top Header Section */}
        <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">{report.status}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">#CIV-{report._id.slice(-5).toUpperCase()}</span>
                </div>
                <span className="text-xs font-medium text-slate-500">{timeAgo(report.created_at)}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {report.issue_type}
            </h1>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <User size={16} className="text-indigo-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-300">Citizen Info</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={16} className="text-rose-500" />
                    <span className="text-sm font-medium">Mount Road, Chennai</span>
                </div>
            </div>
        </div>

        {/* Main Image */}
        <div className="w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl mb-12">
            <img 
                src={report.image_url.startsWith('http') ? report.image_url : `${BACKEND_URL}${report.image_url}`} 
                alt={report.issue_type}
                className="w-full h-auto max-h-[600px] object-cover"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            
            {/* Description */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-black text-white">Description</h2>
              <p className="text-[17px] leading-relaxed text-slate-300 opacity-90">
                {report.description || "No detailed description provided."}
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-[#151B28] p-6 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-rose-400">
                     <AlertCircle size={18} />
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Severity Levels</span>
                  </div>
                  <span className="text-lg font-bold text-white tracking-tight">{report.severity}</span>
               </div>
               <div className="bg-[#151B28] p-6 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                     <Building2 size={18} />
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Assigned Authority</span>
                  </div>
                  <span className="text-lg font-bold text-white tracking-tight">Chennai Corporation - Zone 9</span>
               </div>
            </div>

            {/* Voting & Action Bar */}
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-[#151B28] rounded-xl border border-white/5 p-1">
                    <button 
                        onClick={() => handleVote('up')}
                        className={`p-2 rounded-lg transition-all ${userVote === 'up' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <ArrowBigUp size={24} className={userVote === 'up' ? 'fill-indigo-400' : ''} />
                    </button>
                    <span className="px-4 font-black text-white text-lg">{report.score || 0}</span>
                    <button 
                        onClick={() => handleVote('down')}
                        className={`p-2 rounded-lg transition-all ${userVote === 'down' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <ArrowBigDown size={24} className={userVote === 'down' ? 'fill-rose-400' : ''} />
                    </button>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 bg-[#151B28] hover:bg-white/5 text-slate-400 hover:text-white border border-white/5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                    <Copy size={16} />
                    Mark Duplicate
                </button>
            </div>

            {/* Comments Section */}
            <Comments reportId={id} theme="dark" />
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Status Tracker */}
            <div className="bg-[#151B28] p-8 rounded-3xl border border-white/5 flex flex-col gap-8">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Status Tracker</h3>
               <VerticalStatusTracker currentStatus={report.status} />
            </div>

            {/* Location Reference */}
            <div className="bg-[#151B28] p-8 rounded-3xl border border-white/5 flex flex-col gap-6">
               <div className="flex items-center gap-2 text-rose-500">
                  <MapPin size={18} />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Location Reference</h3>
               </div>
               <div className="w-full bg-[#0B0F19] p-6 rounded-2xl flex flex-col items-center gap-3 border border-white/5 shadow-inner">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <MapPin size={24} className="text-rose-500" />
                  </div>
                  <span className="text-sm font-black text-white">
                    {report.location.coordinates[1].toFixed(3)}, {report.location.coordinates[0].toFixed(3)}
                  </span>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportPage;
