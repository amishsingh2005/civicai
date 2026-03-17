import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ArrowLeft, MapPin, AlertTriangle, Info, Calendar, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

// Fix Leaflet marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const IssueDetails = ({ complaints }) => {
  const { id } = useParams();
  const issue = complaints.find(c => c.id === id);

  useEffect(() => {
    if (issue) {
      document.title = `CivicAI | ${issue.id}`;
    }
  }, [issue]);

  if (!issue) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 py-20">
        <h2 className="text-2xl font-bold text-white">Issue not found</h2>
        <Link to="/admin/dashboard" className="text-indigo-500 hover:underline">Return to Admin Dashboard</Link>
      </div>
    );
  }

  const severityIcon = {
    'High': <AlertTriangle className="text-red-500" size={20} />,
    'Medium': <Info className="text-yellow-500" size={20} />,
    'Low': <Info className="text-green-500" size={20} />,
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in zoom-in duration-300">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl group-hover:border-slate-700">
            <ArrowLeft size={20} />
          </div>
          <span className="font-medium text-sm">Back to Dashboard</span>
        </Link>
        
        <div className="flex gap-2">
           <button className="bg-slate-900 border border-slate-800 text-slate-300 py-2 px-6 rounded-2xl hover:bg-slate-800 transition-all text-sm font-semibold">Print Details</button>
           <button className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-6 rounded-2xl transition-all text-sm font-semibold shadow-lg shadow-indigo-500/20">Assign Officer</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Issue Reference</h3>
                <h2 className="text-2xl font-black text-white">{issue.id}</h2>
              </div>
              <StatusBadge status={issue.status} />
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500 mt-1">
                  <Info size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Problem Type</p>
                  <p className="text-slate-200 font-semibold">{issue.type}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-800 rounded-xl text-slate-400 mt-1">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Location Area</p>
                  <p className="text-slate-200 font-semibold leading-relaxed">{issue.location}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">{issue.latitude}, {issue.longitude}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl mt-1 ${issue.severity === 'High' ? 'bg-red-500/10' : issue.severity === 'Medium' ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                  {severityIcon[issue.severity]}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Severity Level</p>
                  <p className={`font-bold ${issue.severity === 'High' ? 'text-red-500' : issue.severity === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                    {issue.severity} Priority
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Issue Image Card */}
          {issue.image && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom duration-700">
              <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3 px-2">Evidence / Photo</h3>
              <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-video relative group cursor-pointer">
                <img 
                  src={issue.image} 
                  alt={issue.type} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                     <span className="text-white text-[10px] font-bold uppercase tracking-wider">Geotagged Photo</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Right Column: Map */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 h-full min-h-[500px] shadow-sm flex flex-col">
            <div className="mb-4 flex justify-between items-center px-2">
              <h3 className="font-bold text-slate-200">Issue Location Map</h3>
              <div className="flex gap-2">
                 <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded-full font-bold">GPS VERIFIED</span>
              </div>
            </div>
            
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 relative shadow-inner">
              <MapContainer 
                center={[issue.latitude, issue.longitude]} 
                zoom={15} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[issue.latitude, issue.longitude]}>
                  <Popup>
                    <div className="text-center font-sans">
                      <strong className="block mb-1">{issue.id}</strong>
                      <span className="text-xs text-slate-500">{issue.type}</span>
                    </div>
                  </Popup>
                </Marker>
                <ZoomControl position="bottomright" />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
