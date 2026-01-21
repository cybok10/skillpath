
import { api } from './api';
import { StudentProfile } from '../types';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  },

  // New method for Social Login
  googleLogin: async (email: string, name: string, photoUrl?: string) => {
    try {
      // We send the profile data we 'received' from the provider to our backend
      const response = await api.post('/auth/google', { 
        email, 
        name, 
        photoUrl, 
        providerId: 'google' 
      });
      
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Google login failed', error);
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { full_name: name, email, password });
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_profile');
  },

  updateProfile: async (profile: Partial<StudentProfile>) => {
    try {
      // We still save to local storage for instant UI updates/offline support
      localStorage.setItem('user_profile', JSON.stringify(profile));
      
      // Sync with backend
      await api.put('/users/profile', profile);
      return true;
    } catch (error) {
      console.error('Failed to sync profile', error);
      // Don't throw here to allow offline flow to continue
      return false;
    }
  }
};
