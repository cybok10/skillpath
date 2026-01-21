
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, Search, Menu, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [streak, setStreak] = useState(0);
  const [initials, setInitials] = useState('U');

  useEffect(() => {
    // Calculate Streak
    const calculateStreak = () => {
      const today = new Date();
      const todayStr = today.toDateString();
      
      const lastLoginStr = localStorage.getItem('last_login_date');
      const storedStreakStr = localStorage.getItem('user_streak');
      
      let currentStreak = parseInt(storedStreakStr || '0', 10);

      // Scenario 1: No history (New User)
      if (!lastLoginStr) {
        currentStreak = 1;
        localStorage.setItem('last_login_date', todayStr);
        localStorage.setItem('user_streak', currentStreak.toString());
        setStreak(currentStreak);
        return;
      }

      // Scenario 2: Already logged in today (No change to streak count)
      if (lastLoginStr === todayStr) {
        setStreak(currentStreak > 0 ? currentStreak : 1);
        return;
      }

      // Scenario 3: Check if logged in yesterday (Consecutive)
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastLoginStr === yesterdayStr) {
        // Consecutive login: Increment streak
        currentStreak += 1;
      } else {
        // Scenario 4: Broken streak (missed a day or more) -> Reset to 1
        currentStreak = 1;
      }

      // Update storage with new streak and today's date
      localStorage.setItem('last_login_date', todayStr);
      localStorage.setItem('user_streak', currentStreak.toString());
      setStreak(currentStreak);
    };

    calculateStreak();

    // Get User Initials
    const storedProfile = localStorage.getItem('user_profile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        if (profile.name) {
          const names = profile.name.trim().split(' ');
          if (names.length >= 2) {
            setInitials(`${names[0][0]}${names[names.length - 1][0]}`.toUpperCase());
          } else if (names.length === 1) {
            setInitials(names[0].substring(0, 2).toUpperCase());
          }
        }
      } catch (e) {
        console.error("Error parsing profile for layout", e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Mobile Header / Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center md:hidden gap-3">
             <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Menu size={24} />
             </button>
             <span className="font-bold text-lg text-gray-800">SkillPath</span>
          </div>

          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
            <Search size={18} className="text-gray-400" />
            <input 
                type="text" 
                placeholder="Search resources, mentors, or skills..." 
                className="bg-transparent border-none focus:outline-none ml-2 w-full text-sm text-gray-700"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100" title="Daily Streak">
                <Flame size={18} className="text-orange-500 fill-orange-500" />
                <span className="font-bold text-orange-700 text-sm">{streak} Day{streak !== 1 ? 's' : ''}</span>
            </div>

            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <Link to="/profile" className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-medium text-sm hover:ring-2 ring-brand-200 transition-all cursor-pointer">
              {initials}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
