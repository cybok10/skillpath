
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { generateRoadmap, predictFutureImpact } from '../services/geminiService';
import { Roadmap as RoadmapType, Milestone, FullProfileDTO } from '../types';
import { api } from '../services/api';
import { CheckCircle, Circle, Lock, ExternalLink, RefreshCw, ChevronRight, Sparkles, X, Globe, BrainCircuit } from 'lucide-react';

export const Roadmap: React.FC = () => {
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  
  // Future Impact State
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [impactAnalysis, setImpactAnalysis] = useState<string>('');
  const [analyzingImpact, setAnalyzingImpact] = useState(false);

  useEffect(() => {
    fetchRoadmapData();
  }, []);

  const fetchRoadmapData = async () => {
    let goal = "Full Stack Developer";
    let skills = ["HTML", "CSS"];

    // 1. Fetch Profile info from Backend API
    try {
        const profileData: FullProfileDTO = await api.get('/api/profile/me');
        if (profileData && profileData.user && profileData.user.profile) {
            if (profileData.user.profile.careerGoal) {
                goal = profileData.user.profile.careerGoal;
            }
            // Use Skills from backend logic or legacy array
            if (profileData.skills.length > 0) {
                skills = profileData.skills.map(s => s.skillName);
            } else if (profileData.user.profile.preferredTech) {
                skills = profileData.user.profile.preferredTech;
            }
        }
    } catch (e) {
        console.error("Failed to fetch profile for roadmap", e);
    }

    // 2. Check local storage for cached roadmap
    const storedRoadmap = localStorage.getItem('skillpath_roadmap');
    if (storedRoadmap) {
        try {
            const parsed = JSON.parse(storedRoadmap);
            // If stored roadmap matches user goal, use it
            if (parsed.goal === goal) {
                setRoadmap(parsed);
                setSelectedMilestone(parsed.milestones[0]);
                setLoading(false);
                return;
            }
        } catch(e) {}
    }

    // 3. Generate new roadmap via AI if no match
    const generated = await generateRoadmap(goal, skills);
    setRoadmap(generated);
    setSelectedMilestone(generated.milestones[0]);
    localStorage.setItem('skillpath_roadmap', JSON.stringify(generated));
    setLoading(false);
  };

  const handleRegenerate = async () => {
    setLoading(true);
    let goal = roadmap?.goal || "Full Stack Developer";
    let skills = ["HTML", "CSS"];

    // Fetch latest profile state to ensure regeneration uses current data
    try {
        const profileData: FullProfileDTO = await api.get('/api/profile/me');
        if (profileData?.user?.profile?.careerGoal) goal = profileData.user.profile.careerGoal;
        if (profileData?.skills?.length) skills = profileData.skills.map(s => s.skillName);
    } catch(e) {}

    const generated = await generateRoadmap(goal, skills);
    setRoadmap(generated);
    setSelectedMilestone(generated.milestones[0]);
    localStorage.setItem('skillpath_roadmap', JSON.stringify(generated));
    setLoading(false);
  }

  const handleFutureImpact = async () => {
    if (!roadmap?.goal) return;
    setShowImpactModal(true);
    
    // Only fetch if we haven't already for this session (simple caching)
    if (impactAnalysis) return;

    setAnalyzingImpact(true);
    const analysis = await predictFutureImpact(roadmap.goal);
    setImpactAnalysis(analysis);
    setAnalyzingImpact(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-brand-600">AI</span>
            </div>
          </div>
          <div className="text-center">
             <p className="text-lg font-bold text-gray-800">Designing your career path...</p>
             <p className="text-sm text-gray-500 mt-1">Analyzing your skills and goals to build the perfect roadmap.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">AI Generated</span>
                <span className="text-gray-400 text-xs">• Based on your profile</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Roadmap: {roadmap?.goal}</h1>
            <p className="text-gray-500">Your personalized step-by-step guide to mastery.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleFutureImpact}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:opacity-90 transition-all shadow-sm text-sm font-medium active:scale-95"
            >
                <Sparkles size={16} />
                Future Impact Analysis
            </button>
            <button 
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium active:scale-95"
            >
                <RefreshCw size={16} />
                Regenerate
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-14rem)]">
        {/* Milestones List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto p-2 scrollbar-hide">
            {roadmap?.milestones.map((milestone, index) => {
                const isSelected = selectedMilestone?.id === milestone.id;
                let StatusIcon = Circle;
                let statusColor = "text-gray-400";
                
                if (milestone.status === 'completed') {
                    StatusIcon = CheckCircle;
                    statusColor = "text-green-500";
                } else if (milestone.status === 'in-progress') {
                    StatusIcon = Circle; 
                    statusColor = "text-brand-500";
                } else {
                    StatusIcon = Lock;
                    statusColor = "text-gray-300";
                }

                return (
                    <div 
                        key={milestone.id}
                        onClick={() => setSelectedMilestone(milestone)}
                        className={`p-4 rounded-xl cursor-pointer mb-2 transition-all border ${
                            isSelected 
                            ? 'bg-brand-50 border-brand-200 shadow-sm' 
                            : 'hover:bg-gray-50 border-transparent'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`mt-1 ${statusColor}`}>
                                <StatusIcon size={20} fill={milestone.status === 'completed' ? 'currentColor' : 'none'} />
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-semibold text-sm ${isSelected ? 'text-brand-900' : 'text-gray-800'}`}>
                                    {milestone.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{milestone.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                        milestone.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                        milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                        {milestone.status.replace('-', ' ').toUpperCase()}
                                    </span>
                                    <span className="text-[10px] text-gray-400">{milestone.estimatedHours} hrs</span>
                                </div>
                            </div>
                            {isSelected && <ChevronRight size={16} className="text-brand-400 self-center" />}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col overflow-y-auto">
            {selectedMilestone ? (
                <>
                    <div className="border-b border-gray-100 pb-6 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                Module {roadmap?.milestones.findIndex(m => m.id === selectedMilestone.id)! + 1}
                            </span>
                            <span className="text-gray-400 text-sm">• {selectedMilestone.estimatedHours} hours estimated</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedMilestone.title}</h2>
                        <p className="text-gray-600 leading-relaxed text-lg">{selectedMilestone.description}</p>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                            Curated Resources
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedMilestone.resources.map((res, i) => (
                                <a 
                                    key={i} 
                                    href={res.url} 
                                    className="block p-4 rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all group bg-gray-50 hover:bg-white"
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded mb-2 inline-block ${
                                            res.type === 'video' ? 'bg-red-100 text-red-600' :
                                            res.type === 'article' ? 'bg-blue-100 text-blue-600' :
                                            'bg-purple-100 text-purple-600'
                                        }`}>
                                            {res.type.toUpperCase()}
                                        </span>
                                        <ExternalLink size={14} className="text-gray-400 group-hover:text-brand-500" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800 group-hover:text-brand-700 mb-1">
                                        {res.title}
                                    </h4>
                                    <p className="text-xs text-gray-500">Click to view material</p>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                         <button className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium shadow-md hover:bg-brand-700 transition-transform active:scale-95">
                            Mark as Completed
                         </button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p>Select a milestone to view details</p>
                </div>
            )}
        </div>
      </div>

      {/* Future Impact Modal */}
      {showImpactModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Future Impact Analysis</h2>
                            <p className="text-sm text-gray-500">How emerging tech affects {roadmap?.goal}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowImpactModal(false)}
                        className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {analyzingImpact ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <BrainCircuit size={24} className="text-purple-600" />
                                </div>
                            </div>
                            <p className="text-gray-600 font-medium">Consulting the oracle of future tech...</p>
                        </div>
                    ) : (
                        <div className="prose prose-purple max-w-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                                    <h3 className="text-purple-900 font-bold flex items-center gap-2 mb-3">
                                        <Globe size={20} /> Societal Shift
                                    </h3>
                                    <p className="text-purple-800 text-sm opacity-80">
                                        Understanding how your role shapes the world around us.
                                    </p>
                                </div>
                                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                                    <h3 className="text-indigo-900 font-bold flex items-center gap-2 mb-3">
                                        <BrainCircuit size={20} /> AI & Automation
                                    </h3>
                                    <p className="text-indigo-800 text-sm opacity-80">
                                        Navigating the balance between human creativity and machine efficiency.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                                {impactAnalysis.split('\n').map((line, i) => {
                                    if (line.trim().startsWith('**')) {
                                        return <h3 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                                    }
                                    return <p key={i} className="mb-2">{line.replace(/\*\*/g, '')}</p>;
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                        onClick={() => setShowImpactModal(false)}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg active:scale-95"
                    >
                        Close Analysis
                    </button>
                </div>
            </div>
        </div>
      )}
    </Layout>
  );
};
