
import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../components/Layout';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { 
  Trophy, Zap, Target, Clock, Award, Share2, Settings, 
  Briefcase, Activity, Star, Shield, Camera, Upload
} from 'lucide-react';
import { api } from '../services/api';
import { FullProfileDTO } from '../types';

export const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<FullProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      let data: FullProfileDTO | null = null;
      
      // 1. Attempt to fetch from Backend API
      try {
        const response = await api.get('/api/profile/me');
        if (response && response.user) {
            data = response;
            // CACHE: Save successful fetch to local storage
            localStorage.setItem('cached_full_profile', JSON.stringify(data));
        }
      } catch (err) {
        console.log("Backend API request failed.");
      }

      // 2. If backend failed, try Cached API Data
      if (!data) {
        const cached = localStorage.getItem('cached_full_profile');
        if (cached) {
            data = JSON.parse(cached);
            console.log("Loaded profile from cache.");
        }
      }

      // 3. If still no data (First time user, Offline, No Backend), construct Default/Mock
      if (!data) {
        const storedProfileStr = localStorage.getItem('user_profile');
        const storedProfile = storedProfileStr ? JSON.parse(storedProfileStr) : {};
        
        // Default Mock Base for Demo
        data = {
            user: {
                id: 'local-user',
                name: storedProfile.name || 'Student',
                email: storedProfile.email || 'student@example.com',
                role: 'STUDENT' as any,
                xp: 1500,
                level: 3,
                streak: parseInt(localStorage.getItem('user_streak') || '0', 10),
                globalRank: 1254,
                joinDate: new Date().toISOString(),
                profilePictureUrl: '' // Default empty
            },
            skills: [
                { id: 1, skillName: 'Problem Solving', category: 'Programming', score: 60, level: 'Intermediate' },
                { id: 2, skillName: 'Communication', category: 'Web', score: 70, level: 'Intermediate' }
            ],
            recentActivity: [],
            badges: [
                 { id: 1, name: 'Early Bird', description: 'Joined the platform', icon: 'Star', awardedAt: new Date().toISOString() }
            ],
            careerReadiness: {
                score: 35,
                missingSkills: ['Advanced Concepts', 'System Design'],
                targetRole: storedProfile.careerGoal || 'Software Engineer',
                readinessLevel: 'Low'
            },
            stats: {
                totalLearningHours: 5,
                coursesCompleted: 0,
                labsCompleted: 0
            }
        };

        // Enrich with onboarding skills
        if (storedProfile.preferredTech && Array.isArray(storedProfile.preferredTech)) {
            const techSkills = storedProfile.preferredTech.map((tech: string, idx: number) => ({
                id: idx + 10,
                skillName: tech.charAt(0).toUpperCase() + tech.slice(1),
                category: 'Programming',
                score: 40, // Base starting score
                level: 'Beginner'
            }));
            data.skills = [...data.skills, ...techSkills];
        }
      }

      setProfileData(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 1.5) { // 1.5MB Limit
          alert("File size too large. Please select an image under 1.5MB.");
          return;
      }

      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
            await api.put('/users/profile', { profilePictureUrl: base64String });
            
            // Update local state immediately
            if (profileData) {
                setProfileData({
                    ...profileData,
                    user: {
                        ...profileData.user,
                        profilePictureUrl: base64String
                    }
                });
            }
        } catch (error) {
            console.error("Failed to upload image", error);
            alert("Failed to upload image. Please check your connection.");
        } finally {
            setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading || !profileData) {
      return (
          <Layout>
              <div className="h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
              </div>
          </Layout>
      );
  }

  // Transform skills for Radar Chart
  const radarData = profileData.skills.map(s => ({
      subject: s.skillName,
      A: s.score,
      fullMark: 100
  }));

  // Calculate XP Progress to next level (Simple Logic: Level * 1000)
  const xpForNextLevel = (profileData.user.level + 1) * 1000;
  const xpProgress = (profileData.user.xp % 1000) / 10; 
  
  // Logic to determine image source
  const profileImageSrc = profileData.user.profilePictureUrl 
    ? profileData.user.profilePictureUrl 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.user.name)}&background=0D8ABC&color=fff&size=200`;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-900 to-brand-700 opacity-90"></div>
            
            <div className="relative mt-12 flex flex-col md:flex-row gap-6 items-end md:items-center">
                <div className="relative group">
                    <img 
                        src={profileImageSrc}
                        alt="Profile" 
                        className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
                    />
                    {/* Upload Overlay */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-white"
                    >
                        {uploading ? (
                            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                            <Camera className="text-white" size={24} />
                        )}
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/*" 
                        className="hidden" 
                    />

                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-lg border border-white shadow-sm flex items-center gap-1">
                        <Trophy size={12} />
                        Lvl {profileData.user.level}
                    </div>
                </div>
                
                <div className="flex-1 mb-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{profileData.user.name}</h1>
                            <p className="text-gray-500 flex items-center gap-2">
                                <Briefcase size={16} />
                                {profileData.careerReadiness.targetRole} • Joined {new Date(profileData.user.joinDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium">
                                <Share2 size={16} /> Share
                            </button>
                            <button className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 font-medium shadow-md">
                                <Settings size={16} /> Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span className="text-brand-700">{profileData.user.xp.toLocaleString()} XP</span>
                            <span className="text-gray-400">Next Level: {xpForNextLevel.toLocaleString()} XP</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full" style={{ width: `${xpProgress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Zap size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">{profileData.user.streak}</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Day Streak</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Target size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">#{profileData.user.globalRank}</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Global Rank</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Clock size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">{profileData.stats.totalLearningHours}h</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Learning Time</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Award size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">{profileData.badges.length}</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Badges</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- LEFT COLUMN (SKILLS & READINESS) --- */}
            <div className="lg:col-span-1 space-y-6">
                {/* Skill Radar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-brand-600" /> Skill Matrix
                    </h3>
                    <div className="h-64 w-full -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid gridType="polygon" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                <Radar name="Skills" dataKey="A" stroke="#16a34a" fill="#22c55e" fillOpacity={0.4} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-2">
                        {profileData.skills.slice(0, 5).map((skill) => (
                            <div key={skill.id} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">{skill.skillName}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    skill.level === 'Advanced' ? 'bg-green-100 text-green-700' :
                                    skill.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}>{skill.level}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Career Readiness */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <h3 className="font-bold text-gray-900 mb-2">Career Readiness</h3>
                     <p className="text-xs text-gray-500 mb-4">Target: {profileData.careerReadiness.targetRole}</p>
                     
                     <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="4" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray={`${profileData.careerReadiness.score}, 100`} />
                            </svg>
                            <span className="absolute text-sm font-bold text-blue-600">{profileData.careerReadiness.score}%</span>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">{profileData.careerReadiness.readinessLevel}</div>
                            <div className="text-xs text-gray-500">Based on skill verification</div>
                        </div>
                     </div>

                     <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                        <span className="text-xs font-bold text-red-700 block mb-1">SKILL GAPS</span>
                        <div className="flex flex-wrap gap-2">
                            {profileData.careerReadiness.missingSkills.map(s => (
                                <span key={s} className="text-xs bg-white text-red-600 px-2 py-1 rounded border border-red-100">{s}</span>
                            ))}
                        </div>
                     </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN (ACTIVITY & GAMIFICATION) --- */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900">Recent Activity</h3>
                        <button className="text-sm text-brand-600 font-medium hover:underline">View All</button>
                    </div>

                    {profileData.recentActivity.length > 0 ? (
                        <div className="space-y-6">
                            {profileData.recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex gap-4 relative">
                                    {idx !== profileData.recentActivity.length - 1 && (
                                        <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>
                                    )}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                                        activity.activityType === 'COURSE' ? 'bg-blue-100 text-blue-600' :
                                        activity.activityType === 'LAB' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        {activity.activityType === 'COURSE' ? <Briefcase size={18} /> : 
                                        activity.activityType === 'LAB' ? <Activity size={18} /> : <Target size={18} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">{activity.title}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Completed {new Date(activity.timestamp).toLocaleDateString()} • {activity.activityType}
                                                </p>
                                            </div>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                +{activity.xpEarned} XP
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 uppercase tracking-wider">
                                                {activity.skillTag}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            No recent activity. Start a module in your Roadmap!
                        </div>
                    )}
                </div>

                {/* Badges */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-6">Earned Badges</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {profileData.badges.map((badge) => (
                            <div key={badge.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                    <Star className="text-yellow-500 fill-yellow-500" size={24} />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">{badge.name}</h4>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{badge.description}</p>
                            </div>
                        ))}
                        {/* Locked Badge Placeholder */}
                        <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center text-center opacity-60">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <Shield className="text-gray-400" size={24} />
                            </div>
                            <h4 className="font-bold text-gray-400 text-sm">Locked</h4>
                            <p className="text-xs text-gray-400 mt-1">Complete 5 Labs</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};
