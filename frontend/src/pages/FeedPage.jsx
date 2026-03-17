import { useState, useEffect } from 'react';
import { MessageSquare, Share, MoreHorizontal, ArrowBigUp, ArrowBigDown, MapPin, Flame, Map as MapIcon, List as ListIcon, Moon, Sun, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import reportApi from '../api/reports';
import mockComplaints from '../data/complaints.json';
import 'leaflet/dist/leaflet.css';


// Fix for default leaflet icons not showing correctly sometimes in React
delete L.Icon.Default.prototype._getIconUrl;   
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BACKEND_URL = 'http://localhost:8000';

// Helper to create colored dot markers based on Status
const getMarkerIcon = (status) => {
  let bgColor = 'bg-[#6B7280]';
  let shadow = 'shadow-[#6B7280]/50';
  
  if (status === 'Open') {
    bgColor = 'bg-[#EF4444]';
    shadow = 'shadow-[#EF4444]/70';
  } else if (status === 'In Progress') {
    bgColor = 'bg-[#F59E0B]';
    shadow = 'shadow-[#F59E0B]/70';
  } else if (status === 'Resolved') {
    bgColor = 'bg-[#22C55E]';
    shadow = 'shadow-[#22C55E]/70';
  }

  const html = `
    <div class="w-6 h-6 rounded-full border-[2.5px] border-white ${bgColor} shadow-lg ${shadow} shadow-[0_0_12px_var(--tw-shadow-color)] transition-transform hover:scale-125"></div>
  `;

  return L.divIcon({
    className: 'custom-div-icon',
    html: html,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};


export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('feed'); // 'feed' or 'map'
  const [mapTheme, setMapTheme] = useState('light'); // 'light' or 'dark'
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const data = await reportApi.getFeed();
      
      // Backend mapping
      const backendPosts = data.map(report => ({
        id: report._id,
        author: 'Reported by Citizen',
        ticketId: report._id.toString().length > 10 ? `#CIV-${report._id.slice(-5).toUpperCase()}` : `#CIV-${report._id}`,
        timeAgo: new Date(report.created_at).toLocaleDateString(),
        title: report.issue_type,
        status: report.status,
        location: report.location_name || `Lat: ${report.location.coordinates[1].toFixed(4)}, Lng: ${report.location.coordinates[0].toFixed(4)}`,
        coordinates: [report.location.coordinates[1], report.location.coordinates[0]],
        description: report.description || `Reported ${report.issue_type} which requires attention.`,
        image: report.image_url.startsWith('http') ? report.image_url : `${BACKEND_URL}${report.image_url}`,
        upvotes: report.score || 0,
        downvotes: 0,
        userVote: null
      }));

      // Mock data mapping (from complaints.json)
      const mockPosts = mockComplaints.map(report => ({
        id: report.id,
        author: 'Verified Issue',
        ticketId: `#${report.id}`,
        timeAgo: '2 days ago', // Default for mock
        title: report.type,
        status: report.status,
        location: report.location,
        coordinates: [report.latitude, report.longitude],
        description: `Persistent ${report.type.toLowerCase()} reported at ${report.location}. This is a ${report.severity.toLowerCase()} severity issue currently marked as ${report.status.toLowerCase()}.`,
        image: report.image,
        upvotes: Math.floor(Math.random() * 50) + 20, // Give some fake traction
        downvotes: 0,
        userVote: null
      }));

      // Combine and filter duplicates if any (by ID)
      const combined = [...backendPosts];
      mockPosts.forEach(mp => {
        if (!combined.some(bp => bp.id === mp.id)) {
          combined.push(mp);
        }
      });

      setPosts(combined);

    } catch (err) {
      setError('Failed to load feed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleVote = async (postId, voteType) => {
    if (!user) {
      alert("Please Sign In to vote on issues!");
      navigate('/auth');
      return;
    }

    try {
      const type = voteType === 'up' ? 1 : -1;
      const result = await reportApi.vote({
        report_id: postId,
        user_id: user.user_id,
        vote_type: type
      });
      
      // Update local state with the new score returned by backend
      setPosts(prevPosts => prevPosts.map(post => 
        post.id === postId ? { ...post, upvotes: result.new_score, userVote: voteType } : post
      ));
    } catch (err) {
      console.error('Voting error:', err);
    }
  };

  const sortedPosts = [...posts].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  const trendingPosts = sortedPosts.slice(0, 3);

  // Focus a specific post in Feed view
  const scrollToPost = (id) => {
    setViewMode('feed');
    setTimeout(() => {
      const el = document.getElementById(`post-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[#4F46E5]', 'ring-offset-2', 'ring-offset-[#0B0F19]');
        setTimeout(() => el.classList.remove('ring-2', 'ring-[#4F46E5]', 'ring-offset-2', 'ring-offset-[#0B0F19]'), 2000);
      }
    }, 100);
  };

  return (
    <div className="w-full flex justify-center py-6 px-4 gap-8">
      
      {/* Main Column */}
      <div className="w-full max-w-3xl flex flex-col gap-6">
        
        {/* View Toggle & Refresh */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="flex bg-[var(--bg-secondary)] p-1.5 rounded-full border border-[var(--border-color)] w-64 shadow-xl shrink-0">
            <button 
              onClick={() => setViewMode('feed')}
              className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all ${viewMode === 'feed' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] border border-indigo-400 shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'}`}
            >
              <ListIcon size={16} />
              Feed
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex-1 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] border border-indigo-400 shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'}`}
            >
              <MapIcon size={16} />
              Map
            </button>
          </div>
          
          <button 
            onClick={() => fetchPosts(true)}
            disabled={refreshing || loading}
            className="p-3 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-indigo-400 transition-all shadow-lg disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 size={40} className="animate-spin text-indigo-500" />
            <span className="text-[var(--text-secondary)] font-medium">Scanning for recent issues...</span>
          </div>
        ) : error ? (
          <div className="w-full py-10 px-6 glass-card border-red-500/20 text-center flex flex-col items-center gap-4">
            <span className="text-red-400 font-bold">{error}</span>
            <button onClick={() => fetchPosts()} className="btn-primary px-6 py-2 rounded-full text-sm">Retry</button>
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="w-full py-20 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <MapPin size={40} />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">All Clear!</h3>
            <p className="text-[var(--text-secondary)]">No reports found in your area yet.</p>
          </div>
        ) : (
          viewMode === 'map' ? (
            /* MAP VIEW */
            <div className="w-full h-[700px] rounded-3xl overflow-hidden border border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] relative">
              
              {/* Map Theme Toggle */}
              <button 
                onClick={() => setMapTheme(prev => prev === 'light' ? 'dark' : 'light')}
                className="absolute top-4 right-4 z-[400] bg-white text-slate-800 p-2.5 rounded-full shadow-lg hover:bg-slate-50 transition-colors border border-slate-200"
                title={`Switch to ${mapTheme === 'light' ? 'Dark' : 'Light'} Map`}
              >
                {mapTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <MapContainer 
                center={[posts[0]?.coordinates[0] || 13.0827, posts[0]?.coordinates[1] || 80.2707]} 
                zoom={13} 
                style={{ height: '100%', width: '100%', background: mapTheme === 'light' ? '#f8fafc' : '#1c1c24' }}
              >
                {/* Toggleable Map Tiles */}
                {mapTheme === 'light' ? (
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="map-tiles"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
                  />
                ) : (
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                )}
                
                {/* Plotted Issue Markers */}
                {sortedPosts.map(post => (
                  <Marker 
                    key={post.id} 
                    position={post.coordinates}
                    icon={getMarkerIcon(post.status)}
                  >
                    <Popup className="custom-popup" closeButton={false}>
                      <div className="w-[240px] flex flex-col gap-2 rounded-xl overflow-hidden shadow-lg border border-slate-200">
                        <div className="h-28 w-full bg-slate-200 relative">
                          <img src={post.image} className="w-full h-full object-cover" alt="issue preview" />
                          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-black/40 text-white shadow-sm`}>
                            {post.status}
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{post.title}</h4>
                          <p className="text-slate-500 text-[11px] mb-2 line-clamp-2">{post.description}</p>
                          <button 
                            onClick={() => scrollToPost(post.id)}
                            className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors"
                          >
                            View in Feed
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Map Legend (Bottom Left) */}
              <div className={`absolute bottom-6 left-6 z-[400] p-4 rounded-xl shadow-xl flex flex-col gap-2.5 pointer-events-none transition-colors duration-300 ${mapTheme === 'light' ? 'bg-white border text-slate-800 border-slate-200' : 'glass-card border-white/10'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${mapTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>Issue Status</h4>
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.6)] border border-white/50"></span>
                  <span className={`text-xs font-medium ${mapTheme === 'light' ? 'text-slate-600' : 'text-[#9CA3AF]'}`}>Open</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.6)] border border-white/50"></span>
                  <span className={`text-xs font-medium ${mapTheme === 'light' ? 'text-slate-600' : 'text-[#9CA3AF]'}`}>In Progress</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)] border border-white/50"></span>
                  <span className={`text-xs font-medium ${mapTheme === 'light' ? 'text-slate-600' : 'text-[#9CA3AF]'}`}>Resolved</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#6B7280] shadow-[0_0_8px_rgba(107,114,128,0.6)] border border-white/50"></span>
                  <span className={`text-xs font-medium ${mapTheme === 'light' ? 'text-slate-600' : 'text-[#9CA3AF]'}`}>Closed</span>
                </div>
              </div>
            </div>
          ) : (
            /* FEED VIEW */
            <div className="flex flex-col gap-6">
              {sortedPosts.map((post) => {
                const score = post.upvotes - post.downvotes;
                
                return (
                  <div 
                    id={`post-${post.id}`} 
                    key={post.id} 
                    onClick={() => navigate(`/report/${post.id}`)}
                    className="glass-card flex transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_16px_rgba(79,70,229,0.15)] overflow-hidden cursor-pointer"
                  >
                    
                      {/* Vertical Voting Bar */}
                    <div 
                      className="w-14 bg-black/5 flex flex-col items-center pt-4 pb-2 px-1 border-r border-[var(--border-color)] shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={() => handleVote(post.id, 'up')}
                        className={`p-1 rounded transition-colors group ${post.userVote === 'up' ? 'text-[#22C55E]' : 'text-[var(--text-secondary)] hover:text-[#22C55E] hover:bg-[#22C55E]/10'}`}
                      >
                        <ArrowBigUp size={26} className={`transition-transform active:scale-75 ${post.userVote === 'up' ? 'fill-[#22C55E] drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : ''}`} />
                      </button>
                      
                      <span className={`font-black text-[15px] my-1 ${post.userVote === 'up' ? 'text-[#22C55E]' : post.userVote === 'down' ? 'text-[#EF4444]' : 'text-[var(--text-primary)]'}`}>
                        {score > 0 ? `+${score}` : score}
                      </span>
                      
                      <button 
                        onClick={() => handleVote(post.id, 'down')}
                        className={`p-1 rounded transition-colors group ${post.userVote === 'down' ? 'text-[#EF4444]' : 'text-[var(--text-secondary)] hover:text-[#EF4444] hover:bg-[#EF4444]/10'}`}
                      >
                        <ArrowBigDown size={26} className={`transition-transform active:scale-75 ${post.userVote === 'down' ? 'fill-[#EF4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''}`} />
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="p-4 flex-1">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-sm bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-xs">
                            {post.author[0]}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[14px] text-[var(--text-primary)]">{post.author}</span>
                              <span className="text-[var(--text-secondary)] text-[11px]">{post.ticketId} • {post.timeAgo}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 
                            ${post.status === 'Open' ? 'bg-[#EF4444]/15 text-[#EF4444]' : 
                              post.status === 'In Progress' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' : 
                              post.status === 'Resolved' ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#6B7280]/20 text-[var(--text-secondary)]'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {post.status}
                          </div>
                        </div>
                      </div>

                      {/* Title & Location */}
                      <h3 className="font-bold text-[18px] text-[var(--text-primary)] leading-tight mb-1">{post.title}</h3>
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-[12px] mb-2">
                         <MapPin size={12} className="text-rose-400" />
                         <span>{post.location}</span>
                      </div>

                      {/* Description */}
                      <p className="text-[14px] leading-relaxed mb-3 text-[var(--text-primary)] opacity-80">
                        {post.description}
                      </p>

                      {/* Image Component */}
                      <div className="w-full rounded-xl overflow-hidden mb-3 bg-[var(--bg-primary)] border border-[var(--border-color)]">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-auto max-h-[450px] object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center gap-4 text-[var(--text-secondary)] text-[13px] font-medium mt-1">
                        <button className="flex items-center gap-1.5 hover:bg-[var(--bg-primary)] px-2 py-1.5 rounded transition-colors">
                          <MessageSquare size={16} />
                          <span>{post.title.length % 15 + 2} Comments</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:bg-[var(--bg-primary)] px-2 py-1.5 rounded transition-colors">
                          <Share size={16} />
                          <span>Share</span>
                        </button>
                        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-auto p-1.5 rounded hover:bg-[var(--bg-primary)]">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Right Sidebar: Trending Topics (Optional Extra feature) */}
      <div className="hidden lg:flex flex-col w-[320px] shrink-0 gap-6">
        <div className="glass-card p-5 sticky top-[100px]">
          <h3 className="text-[var(--text-primary)] font-black text-[16px] mb-4 flex items-center gap-2">
            <Flame size={18} className="text-[#F59E0B]" />
            Trending Issues 🔥
          </h3>
          
          <div className="flex flex-col gap-4">
            {trendingPosts.map((trend, idx) => (
              <div 
                key={trend.id} 
                onClick={() => scrollToPost(trend.id)}
                className="flex flex-col gap-1 border-b border-[var(--border-color)] pb-3 last:border-0 last:pb-0 group"
              >
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">#{idx + 1} • {trend.location.split(',')[0]}</span>
                <span className="text-[14px] text-[var(--text-primary)] font-semibold leading-snug group-hover:text-indigo-500 cursor-pointer transition-colors">
                  {trend.title}
                </span>
                <span className="text-xs text-[#F59E0B] font-semibold">{trend.upvotes - trend.downvotes} Score</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
