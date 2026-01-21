
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, X } from 'lucide-react';
import { authService } from '../services/authService';

declare global {
  interface Window {
    google?: any;
  }
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Google Auth State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');

  // 1. Initialize Real Google Auth (If Client ID is provided)
  // Replace 'YOUR_GOOGLE_CLIENT_ID' with your actual Google Cloud Console Client ID.
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE'; 
  const hasRealGoogleClient = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_CLIENT_ID_HERE';

  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const handleRealGoogleCallback = async (response: any) => {
    try {
        const credential = response.credential;
        const payload = parseJwt(credential);
        
        if (payload) {
            setLoading(true);
            const { email, name, picture } = payload;
            
            // Call auth service
            const success = await authService.googleLogin(email, name, picture);
            
            if (success) {
                navigate('/dashboard');
            } else {
                setError("Google login failed.");
                setLoading(false);
            }
        }
    } catch (err) {
        console.error("Google Auth Error", err);
        setError("Authentication failed");
        setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google && hasRealGoogleClient) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleRealGoogleCallback
      });
      
      const btnDiv = document.getElementById("google-signin-btn");
      if (btnDiv) {
        window.google.accounts.id.renderButton(
          btnDiv,
          { theme: "outline", size: "large", width: 400, text: "sign_in_with", shape: "rectangular" }
        );
      }
    }
  }, [hasRealGoogleClient]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.login(email, password);
      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setLoading(false);
      setError('Invalid credentials. Please try again.');
    }
  };

  // 2. Trigger Logic for Mock
  const initiateGoogleLogin = () => {
    if (hasRealGoogleClient) {
        // If the button didn't render or user clicked a custom trigger (fallback)
        // Usually renderButton handles the click. 
        // We can use prompt() for One Tap or automatic sign-in
        window.google.accounts.id.prompt();
    } else {
        // Fallback: Open Simulated Google Modal to verify email
        setShowGoogleModal(true);
    }
  };

  // 3. Handle Simulated/Manual Google Login
  const confirmGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail) return;

    setGoogleLoading(true);
    
    // Simulate network delay for verification
    setTimeout(async () => {
        try {
            // Generate deterministic mock data based on input
            const namePart = googleEmail.split('@')[0];
            const mockName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            const mockPhoto = `https://ui-avatars.com/api/?name=${mockName}&background=random`;

            // Call Backend
            await authService.googleLogin(googleEmail, mockName, mockPhoto);
            
            setGoogleLoading(false);
            setShowGoogleModal(false);
            navigate('/onboarding');
        } catch (err) {
            setGoogleLoading(false);
            setError("Failed to authenticate with Google.");
        }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex relative">
      {/* Google Simulation Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                         <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                         <span className="font-bold text-gray-700">Sign in with Google</span>
                    </div>
                    <button onClick={() => setShowGoogleModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-8">
                    <p className="text-gray-600 mb-6 text-sm">
                        To continue to <strong>SkillPath AI</strong>, please verify your Google account email.
                    </p>
                    
                    <form onSubmit={confirmGoogleLogin}>
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Google Email</label>
                            <input 
                                type="email" 
                                required
                                value={googleEmail}
                                onChange={(e) => setGoogleEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                placeholder="name@gmail.com"
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <button 
                                type="submit" 
                                disabled={googleLoading}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {googleLoading ? <Loader2 className="animate-spin" size={20} /> : "Continue"}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setShowGoogleModal(false)}
                                className="w-full bg-white text-gray-600 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
                    Secure Login Simulation
                </div>
            </div>
        </div>
      )}

      {/* Left Side - Visual Branding */}
      <div className="hidden lg:flex w-1/2 bg-brand-50 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="relative z-10 max-w-lg">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-brand-200">
                <span className="text-white text-2xl font-bold">SP</span>
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Master your skills.<br/>
                <span className="text-brand-600">Accelerate your career.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join thousands of students and mentors on the most personalized AI-driven growth platform.
            </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Google Login Button Container */}
            <div className="mb-6">
                {hasRealGoogleClient ? (
                    <div id="google-signin-btn" className="w-full h-[50px] flex justify-center"></div>
                ) : (
                    <button 
                        onClick={initiateGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 p-4 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all group active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                        <span>Sign in with Google</span>
                    </button>
                )}
            </div>

            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-400">or continue with email</span>
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" type="checkbox" className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">Remember me</label>
                    </div>
                    <div className="text-sm">
                        <a href="#" className="font-medium text-brand-600 hover:text-brand-500">Forgot password?</a>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-brand-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            Sign in
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">Sign up for free</Link>
            </p>
        </div>
      </div>
    </div>
  );
};
