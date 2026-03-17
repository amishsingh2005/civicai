import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, ArrowBigUp, ArrowBigDown, Clock, AlertCircle, Share2, MoreHorizontal, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import reportApi from '../api/reports';
import Comments from '../components/Comments';

const BACKEND_URL = 'http://localhost:8000';

const StatusTracker = ({ currentStatus }) => {
  const steps = [
    { label: 'Open', status: 'Open', icon: <AlertCircle size={16} /> },
    { label: 'Verified', status: 'In Progress', icon: <ShieldCheck size={16} /> },
    { label: 'Resolved', status: 'Resolved', icon: <CheckCircle2 size={16} /> }
  ];

  const getStepIndex = (s) => steps.findIndex(step => step.status === s);
  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10"></div>
        {steps.map((step, idx) => {
          const isActive = idx <= currentIndex;
          return (
            <div key={idx} className="flex flex-col items-center gap-2 bg-[var(--bg-primary)] px-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-100 text-slate-400'}`}>
                {step.icon}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
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

  return (
    <div className="w-full flex-1 flex justify-center py-6 px-4">
      <div className="w-full max-w-4xl flex flex-col">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-indigo-500 transition-colors mb-6 self-start group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Back to Feed</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Content Column */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="glass-card overflow-hidden">
              <div className="aspect-video w-full bg-slate-900 overflow-hidden relative">
                <img 
                  src={report.image_url.startsWith('http') ? report.image_url : `${BACKEND_URL}${report.image_url}`} 
                  alt={report.issue_type}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                   <div className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest backdrop-blur-md bg-black/40 text-white shadow-lg border border-white/20`}>
                      {report.issue_type}
                   </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight mb-2">
                       {report.issue_type}
                    </h1>
                    <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-rose-500" />
                        <span>Lat: {report.location.coordinates[1].toFixed(4)}, Lng: {report.location.coordinates[0].toFixed(4)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{new Date(report.created_at).toLocaleDateString(undefined, { dateStyle: 'long'})}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <button 
                      onClick={() => handleVote('up')}
                      className={`p-1 transition-colors ${userVote === 'up' ? 'text-green-500' : 'text-slate-400 hover:text-green-500'}`}
                    >
                      <ArrowBigUp size={30} className={userVote === 'up' ? 'fill-green-500' : ''} />
                    </button>
                    <span className="font-black text-lg text-slate-800">{report.score || 0}</span>
                    <button 
                      onClick={() => handleVote('down')}
                      className={`p-1 transition-colors ${userVote === 'down' ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                    >
                      <ArrowBigDown size={30} className={userVote === 'down' ? 'fill-rose-500' : ''} />
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3">Description</h3>
                  <p className="text-[17px] leading-relaxed text-[var(--text-primary)] opacity-90">
                    {report.description}
                  </p>
                </div>

                <div className="mb-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Severity Level</span>
                      <span className={`text-sm font-bold ${report.severity === 'High' ? 'text-rose-600' : report.severity === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                         {report.severity} Priority
                      </span>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <AlertCircle size={20} className={report.severity === 'High' ? 'text-rose-500' : report.severity === 'Medium' ? 'text-amber-500' : 'text-green-500'} />
                   </div>
                </div>

                <StatusTracker currentStatus={report.status} />

                <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-6">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold text-sm transition-colors">
                    <Share2 size={16} />
                    Share
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors ml-auto">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
            </div>

            <Comments reportId={id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-6">
               <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-secondary)] mb-4">Location Data</h3>
               <div className="w-full h-48 bg-slate-100 rounded-xl mb-4 overflow-hidden relative">
                  {/* Static Map Placeholder or real Leaflet Map could go here */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 text-slate-400">
                    <MapPin size={30} />
                    <span className="text-xs font-bold">Map Visualization</span>
                  </div>
               </div>
               <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-xs">
                     <span className="text-slate-400">Latitude</span>
                     <span className="font-bold text-slate-700">{report.location.coordinates[1].toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-slate-400">Longitude</span>
                     <span className="font-bold text-slate-700">{report.location.coordinates[0].toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-slate-400">Nearby Reports</span>
                     <span className="font-bold text-slate-700">+{report.report_count - 1} detections</span>
                  </div>
               </div>
            </div>

            <div className="glass-card p-6 bg-gradient-to-br from-indigo-500 to-purple-600 border-none">
                <h3 className="text-white font-black text-[15px] mb-2 leading-tight">Help resolve this issue faster!</h3>
                <p className="text-white/80 text-xs mb-4 leading-relaxed">Sharing this report and upvoting helps it gain visibility from city officials.</p>
                <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-xl hover:scale-[1.02] transition-transform">
                   Boost Exposure
                </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportPage;
