import { useState } from 'react';
import { User, ShieldCheck, Mail, Lock, UserPlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const location = useLocation();
  const [authMode, setAuthMode] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('mode') === 'signup' ? 'signup' : 'login';
  });

  const [role, setRole] = useState('citizen'); // 'citizen' or 'admin'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, name: authMode === 'signup' ? name : '', role });
    navigate('/report'); // Redirect to report page after auth
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center p-4">
      
      {/* Light Soft UI Glass Card */}
      <div className="soft-glass-panel w-full max-w-md p-10 flex flex-col items-center relative z-20">
        
        {/* Toggle Capsule: Login vs Sign Up */}
        <div 
          className="flex p-1 mb-8 relative w-full rounded-full shadow-inner transition-colors duration-300"
          style={{ background: 'var(--auth-toggle-container)', border: '1px solid var(--border-color)' }}
        >
          <div 
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] flex items-center justify-center rounded-full transition-all duration-300 shadow-sm z-0"
            style={{ 
              left: authMode === 'login' ? '4px' : 'calc(50%)',
              background: 'var(--auth-toggle-active-bg)'
            }}
          />
          <button 
            type="button"
            onClick={() => setAuthMode('login')}
            className="flex-1 py-2.5 text-sm font-bold rounded-full relative z-10 transition-colors"
            style={{ color: authMode === 'login' ? 'var(--auth-toggle-active-text)' : 'var(--auth-toggle-text)' }}
          >
            Sign In
          </button>
          <button 
            type="button"
            onClick={() => setAuthMode('signup')}
            className="flex-1 py-2.5 text-sm font-bold rounded-full relative z-10 transition-colors"
            style={{ color: authMode === 'signup' ? 'var(--auth-toggle-active-text)' : 'var(--auth-toggle-text)' }}
          >
            Sign Up
          </button>
        </div>

        <div className="text-center mb-8 w-full">
          <h2 className="text-3xl font-black mb-2 tracking-tight transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
            {authMode === 'login' ? 'Welcome Back' : 'Join CiviqAI'}
          </h2>
          <p className="text-sm font-medium leading-relaxed transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
            {authMode === 'login' 
              ? 'Sign in to report issues or access the dashboard.' 
              : 'Create an account to track your civic reports.'}
          </p>
        </div>

        {/* Role Selector */}
        <div className="w-full flex gap-4 mb-8">
           <button 
             type="button"
             onClick={() => setRole('citizen')}
             className="flex-1 py-4 rounded-3xl flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-0.5"
             style={{
               background: role === 'citizen' ? 'var(--role-selected-bg)' : 'var(--role-bg)',
               border: `2px solid ${role === 'citizen' ? 'var(--role-selected-border)' : 'var(--role-border)'}`,
               color: role === 'citizen' ? 'var(--role-selected-text)' : 'var(--role-text)',
               boxShadow: role === 'citizen' ? 'var(--role-selected-shadow)' : 'none'
             }}
           >
             <User size={24} style={{ color: role === 'citizen' ? 'var(--role-selected-text)' : 'inherit' }} />
             <span className="font-semibold text-sm">Citizen</span>
           </button>
           <button 
             type="button"
             onClick={() => setRole('admin')}
             className="flex-1 py-4 rounded-3xl flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-0.5"
             style={{
               background: role === 'admin' ? 'var(--role-selected-bg)' : 'var(--role-bg)',
               border: `2px solid ${role === 'admin' ? 'var(--role-selected-border)' : 'var(--role-border)'}`,
               color: role === 'admin' ? 'var(--role-selected-text)' : 'var(--role-text)',
               boxShadow: role === 'admin' ? 'var(--role-selected-shadow)' : 'none'
             }}
           >
             <ShieldCheck size={24} style={{ color: role === 'admin' ? 'var(--role-selected-text)' : 'inherit' }} />
             <span className="font-semibold text-sm">Admin</span>
           </button>
        </div>

        {/* Form Fields using search-input-container styling */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          {authMode === 'signup' && (
             <div className="w-full search-input-container flex items-center px-5 py-3.5 group">
               <UserPlus size={18} className="mr-3 transition-colors duration-300 text-[var(--text-secondary)] group-focus-within:text-[var(--text-link)]" />
               <input 
                 type="text" 
                 placeholder="Full Name" 
                 className="search-input"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 required={authMode === 'signup'}
               />
             </div>
          )}
          
          <div className="w-full search-input-container flex items-center px-5 py-3.5 group">
            <Mail size={18} className="mr-3 transition-colors duration-300 text-[var(--text-secondary)] group-focus-within:text-[var(--text-link)]" />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="search-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="w-full search-input-container flex items-center px-5 py-3.5 group">
            <Lock size={18} className="mr-3 transition-colors duration-300 text-[var(--text-secondary)] group-focus-within:text-[var(--text-link)]" />
            <input 
              type="password" 
              placeholder="Password" 
              className="search-input"
              required
            />
          </div>

          {authMode === 'login' && (
            <div className="w-full text-right mt-1 px-1">
              <a href="#" className="text-xs hover:underline font-bold tracking-wide transition-colors text-[var(--text-link)]">Forgot password?</a>
            </div>
          )}

          <button 
            type="submit"
            className="mt-6 w-full btn-primary py-4 rounded-2xl font-bold text-sm tracking-wide flex justify-center items-center gap-2"
          >
            {authMode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
