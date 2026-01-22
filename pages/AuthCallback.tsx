
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

export const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Store token using authService logic
            localStorage.setItem('auth_token', token);
            
            // Clear any stale user data from previous sessions
            localStorage.removeItem('user_profile');
            localStorage.removeItem('cached_full_profile');
            
            // Redirect to dashboard
            navigate('/dashboard');
        } else {
            // If no token, something went wrong, go back to login
            navigate('/login');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
                <h2 className="text-xl font-bold text-gray-800">Authenticating...</h2>
                <p className="text-gray-500">Please wait while we log you in securely.</p>
            </div>
        </div>
    );
};
