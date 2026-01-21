
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, TrendingUp, Award, Zap, ArrowRight, PlayCircle, BookOpen, Code, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Roadmap, Resource, FullProfileDTO, ActivityLog } from '../types';
import { api } from '../services/api';

export const Dashboard: React.FC = () => {
  const [name, setName] = useState('Student');
  const [careerGoal, setCareerGoal] = useState('My Career');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    focusHours: 0,
    progress: 0,
    badges: 0,
    streak: 0
  });
  const [recommendations, setRecommendations] = useState<(Resource & { milestoneTitle: string })[]>([]);
  const [chartData, setChartData] = useState<{ day: string; hours: number }[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
        // 1. Fetch User Profile from Backend (Dynamic per user)
        const profileData: FullProfileDTO = await api.get('/api/profile/me');
        
        if (profileData && profileData.user) {
            setName(profileData.user.name || 'Student');
            setCareerGoal(profileData.user.profile?.careerGoal || 'Career Growth');
            
            // 2. Process Real-Time Stats
            setStats({
                focusHours: profileData.stats.totalLearningHours,
                progress: calculateProgress(profileData),
                badges: profileData.badges.length,
                streak: profileData.user.streak
            });

            // 3. Process Activity Logs into Chart Data (Dynamic)
            const processedChartData = processActivityToChart(profileData.recentActivity);
            setChartData(processedChartData);
        }
    } catch (error) {
        console.error("Failed to fetch profile", error);
    }

    // 4. Load Roadmap (Pending tasks)
    const roadmapStr = localStorage.getItem('skillpath_roadmap');
    let pendingResources: (Resource & { milestoneTitle: string })[] = [];

    if (roadmapStr) {
        try {
            const roadmap: Roadmap = JSON.parse(roadmapStr);
            const activeMilestone = roadmap.milestones.find(m => m.status === 'in-progress') || roadmap.milestones.find(m => m.status === 'pending');
            
            if (activeMilestone) {
                pendingResources = activeMilestone.resources.map(r => ({
                    ...r,
                    milestoneTitle: activeMilestone.title
                }));
            }
        } catch (e) {}
    }
    setRecommendations(pendingResources.slice(0, 3)); 
    setLoading(false);
  };

  const calculateProgress = (data: FullProfileDTO) => {
    if (!data.skills || data.skills.length === 0) return 0;
    const total = data.skills.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(total / data.skills.length);
  };

  // Helper to aggregate logs into days of the week
  const processActivityToChart = (logs: ActivityLog[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7DaysMap = new Map<number, number>(); // dayIndex -> hours

    // Initialize 0 for last 7 days
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        last7DaysMap.set(d.getDay(), 0);
    }

    // Aggregate logs
    logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        // Only consider logs from last 7 days
        const diffTime = Math.abs(today.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays <= 7) {
            const dayIdx = logDate.getDay();
            const currentHours = last7DaysMap.get(dayIdx) || 0;
            // Assuming durationMinutes exists, else assume 30 mins per activity log
            const minutes = (log as any).durationMinutes || 30;
            last7DaysMap.set(dayIdx, currentHours + (minutes / 60));
        }
    });

    // Convert to Chart array (Reverse order: 6 days ago -> Today)
    const result = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dayIdx = d.getDay();
        result.push({
            day: days[dayIdx],
            hours: parseFloat((last7DaysMap.get(dayIdx) || 0).toFixed(1))
        });
    }
    return result;
  };

  const getResourceIcon = (type: string) => {
    switch(type) {
        case 'video': return PlayCircle;
        case 'project': return Code;
        default: return BookOpen;
    }
  };

  const getResourceMeta = (type: string) => {
      switch(type) {
          case 'video': return 'Video Lesson';
          case 'project': return 'Hands-on Project';
          default: return 'Article / Doc';
      }
  };

  if (loading) {
      return (
          <Layout>
              <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
                  <p className="text-gray-500 font-medium">Syncing your progress...</p>
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {name}! 👋</h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2">
            Target: <span className="font-semibold text-brand-700">{careerGoal}</span>
            <span className="text-gray-300">|</span>
            {stats.streak > 0 
             ? `${stats.streak} day streak 🔥` 
             : "Let's start a streak today!"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {[
          { label: 'Weekly Focus', value: `${stats.focusHours} hrs`, icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { label: 'Skill Progress', value: `${stats.progress}%`, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
          { label: 'Badges Earned', value: stats.badges.toString(), icon: Award, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Current Streak', value: `${stats.streak} Days`, icon: Zap, color: 'bg-purple-50 text-purple-600' },
        ].map((stat, i) => {
            const Icon = stat.icon;
            return (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                </div>
            )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Activity Log</h3>
                    <p className="text-xs text-gray-400">Time spent learning this week</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-gray-500">Live Data</span>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <YAxis hide />
                        <Tooltip 
                            cursor={{fill: '#f3f4f6', radius: 4}} 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="hours" radius={[6, 6, 6, 6]} barSize={32}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.hours > 0 ? '#22c55e' : '#e5e7eb'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Next Steps / Recommendations */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Recommended for you</h3>
            
            {recommendations.length > 0 ? (
                <div className="flex-1 space-y-4">
                    {recommendations.map((item, i) => {
                        const Icon = getResourceIcon(item.type);
                        return (
                            <a 
                                key={i} 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-full bg-brand-50 flex-shrink-0 flex items-center justify-center text-brand-600 group-hover:bg-brand-100 transition-colors">
                                        <Icon size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-gray-800 text-sm truncate pr-2 group-hover:text-brand-700 transition-colors">{item.title}</h4>
                                        <p className="text-xs text-gray-500">{getResourceMeta(item.type)} • {item.milestoneTitle}</p>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-gray-300 flex-shrink-0 group-hover:text-brand-500 transition-colors" />
                            </a>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Zap className="text-gray-400" size={24} />
                    </div>
                    <p className="text-gray-600 font-medium text-sm">No pending tasks!</p>
                    <p className="text-xs text-gray-400 mt-1">Generate a new roadmap to get started.</p>
                </div>
            )}
            
            <Link to="/roadmap" className="mt-4 w-full py-3 bg-gray-900 text-white rounded-xl font-medium text-center hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 active:scale-95">
                {recommendations.length > 0 ? "Continue Learning" : "Go to Roadmap"}
            </Link>
        </div>
      </div>
    </Layout>
  );
};
