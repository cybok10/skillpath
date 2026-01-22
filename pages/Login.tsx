
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2, Github, Linkedin } from 'lucide-react';
import { authService } from '../services/authService';

// Backend URL for Social Login Redirects
const API_BASE_URL = 'http://localhost:8000';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.login(email, password);
      // Wait a bit for token to settle
      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setLoading(false);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex relative">
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

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <a 
                    href={`${API_BASE_URL}/auth/signin/google`}
                    className="flex items-center justify-center py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all group"
                    title="Sign in with Google"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </a>
                
                <a 
                    href={`${API_BASE_URL}/auth/signin/github`}
                    className="flex items-center justify-center py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all text-gray-700 group"
                    title="Sign in with GitHub"
                >
                    <Github size={24} className="group-hover:scale-110 transition-transform" />
                </a>

                <a 
                    href={`${API_BASE_URL}/auth/signin/linkedin`}
                    className="flex items-center justify-center py-3 px-4 border border-gray-200 rounded-xl hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all text-[#0077b5] group"
                    title="Sign in with LinkedIn"
                >
                    <Linkedin size={24} className="group-hover:scale-110 transition-transform" />
                </a>
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
