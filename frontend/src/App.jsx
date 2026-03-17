import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Plus, Paperclip, ArrowRight, ShieldAlert, Image as ImageIcon, Droplets, Trash2, Zap, AlertTriangle, LogOut, Sun, Moon } from 'lucide-react';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function ReportIssue() {
  const [inputText, setInputText] = useState('');

  const issueTypes = [
    { icon: <AlertTriangle size={14} className="text-amber-500" />, label: "Report a pothole" },
    { icon: <Droplets size={14} className="text-blue-500" />, label: "Water pipe leaking" },
    { icon: <Trash2 size={14} className="text-slate-500" />, label: "Garbage not collected" },
    { icon: <Zap size={14} className="text-yellow-500" />, label: "Streetlight not working" },
    { icon: <Droplets size={14} className="text-cyan-500" />, label: "Waterlogging issue" },
  ];

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center pt-10 pb-20 px-4">
      
      {/* Central Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-8">
         <ImageIcon size={32} className="text-white" />
      </div>

      {/* Main Headlines */}
      <h2 className="text-[40px] font-bold text-white mb-4 tracking-tight">
        Report a Civic Issue
      </h2>
      
      <p className="text-[17px] text-[#9CA3AF] max-w-lg text-center mb-12 leading-relaxed">
        Take a photo or paste an image — CiviqAI will extract the location from the image metadata, analyze it, and notify the right department.
      </p>

      {/* Input Area */}
      <div className="w-full max-w-3xl search-input-container flex items-center px-6 py-4 mb-10">
        <input 
          type="text" 
          placeholder="Describe the issue or paste an image (Ctrl+V)..."
          className="search-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        
        <div className="flex items-center gap-3 ml-4">
          <button className="text-[#9CA3AF] hover:text-white transition-colors p-2">
            <Paperclip size={20} />
          </button>
          
          <button className="submit-btn w-10 h-10 flex items-center justify-center shadow-md">
             <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
        {issueTypes.map((issue, idx) => (
          <button key={idx} className="issue-chip px-5 py-2.5 flex items-center gap-2">
            {issue.icon}
            {issue.label}
          </button>
        ))}
      </div>

    </div>
  );
}

function Navigation() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="w-full flex justify-between items-center mb-10">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center shadow-sm">
           <ShieldAlert size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg text-[var(--text-primary)] tracking-tight transition-colors">CiviqAI</span>
      </Link>

      <div className="flex items-center gap-6">
        {/* Animated Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className={`relative w-16 h-8 rounded-full transition-colors duration-300 ease-in-out flex items-center shrink-0 border border-[var(--border-color)] shadow-inner
            ${isDark ? 'bg-[#111827]' : 'bg-[#93C5FD]'}`}
          aria-label="Toggle Theme"
        >
          {/* Sliding Knob */}
          <div 
            className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center shadow-sm
              ${isDark ? 'left-9 bg-[#2E3192]' : 'left-1 bg-white'}`}
          ></div>
          
          {/* Icons Context */}
          <div className="w-full px-1.5 flex justify-between items-center relative z-10 pointer-events-none">
            <Moon size={14} className={`transition-opacity duration-300 ${isDark ? 'text-yellow-200 opacity-100' : 'opacity-0'}`} />
            <Sun size={14} className={`transition-opacity duration-300 ${isDark ? 'opacity-0' : 'text-yellow-500 opacity-100'}`} />
          </div>
        </button>

        <nav className="flex items-center gap-6">
           <Link to="/" className="text-[15px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Feed</Link>
        </nav>
        
        {user ? (
          <div className="flex items-center gap-4">
            <button onClick={logout} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 transition-colors" title="Log out">
              <LogOut size={18} />
            </button>
            <Link to="/report" className="btn-primary px-5 py-2.5 rounded-full text-[15px] font-medium flex items-center gap-2">
              <Plus size={18} />
              Report Issue
            </Link>
          </div>
        ) : (
          <div className="flex bg-[var(--auth-toggle-container)] p-1 rounded-full border border-[var(--border-color)]">
             <Link to="/auth?mode=login" className="px-4 py-1.5 text-sm font-bold rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
               Sign In
             </Link>
             <Link to="/auth?mode=signup" className="px-4 py-1.5 text-sm font-bold rounded-full bg-[var(--text-primary)] text-[var(--bg-primary-start)] shadow-sm hover:-translate-y-0.5 transition-transform duration-300">
               Sign Up
             </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center">
      {/* Ambient background colors */}
      <div className="bg-gradient-spot-1"></div>
      <div className="bg-gradient-spot-2"></div>

      <div className="w-full max-w-6xl p-6 md:p-8 flex-1 flex flex-col z-10">
        <Navigation />

        {/* Main Content Area */}
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/auth" element={<AuthPage key={location.search} />} />
          <Route path="/report" element={
            <ProtectedRoute>
              <ReportIssue />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default function RootApp() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
