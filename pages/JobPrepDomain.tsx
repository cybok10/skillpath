
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { useParams, Link } from 'react-router-dom';
import { JobModule } from '../types';
import { ArrowLeft, BookOpen, Mic, CheckCircle, Lock, Play } from 'lucide-react';
import { api } from '../services/api';

export const JobPrepDomain: React.FC = () => {
    const { domainId } = useParams();
    const [modules, setModules] = useState<JobModule[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock Data for demo purposes. In real app, this comes from backend based on ID.
    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            let data: JobModule[] = [];
            
            if (domainId === 'communication') {
                data = [
                    { id: 'comm-1', domainId: 'communication', title: 'English Speaking Avatar', description: 'Practice real-time conversation with an AI native speaker.', type: 'ai-tutor', difficulty: 'Medium' },
                    { id: 'comm-2', domainId: 'communication', title: 'Grammar Mastery', description: 'Learn essential grammar rules for professional emails.', type: 'learning', difficulty: 'Easy' },
                    { id: 'comm-3', domainId: 'communication', title: 'Public Speaking', description: 'Techniques to overcome stage fear and project voice.', type: 'learning', difficulty: 'Hard' },
                ];
            } else if (domainId === 'aptitude') {
                 data = [
                    { id: 'apt-1', domainId: 'aptitude', title: 'Quantitative Aptitude', description: 'Speed math, percentages, and profit/loss.', type: 'practice', difficulty: 'Medium' },
                    { id: 'apt-2', domainId: 'aptitude', title: 'Logical Reasoning', description: 'Puzzles, seating arrangements, and blood relations.', type: 'practice', difficulty: 'Hard' },
                ];
            } else {
                 data = [
                    { id: 'tech-1', domainId: domainId || '', title: 'Core Concepts', description: 'Foundational theory and architecture.', type: 'learning', difficulty: 'Easy' },
                    { id: 'tech-2', domainId: domainId || '', title: 'System Design', description: 'Scalable architecture patterns.', type: 'learning', difficulty: 'Hard' },
                    { id: 'tech-3', domainId: domainId || '', title: 'Mock Interview', description: 'Simulated technical interview with AI.', type: 'ai-tutor', difficulty: 'Hard' },
                ];
            }
            
            setModules(data);
            setLoading(false);
        }, 500);
    }, [domainId]);

    const getIcon = (type: string) => {
        switch(type) {
            case 'ai-tutor': return Mic;
            case 'practice': return CheckCircle;
            default: return BookOpen;
        }
    };

    return (
        <Layout>
            <div className="mb-6">
                <Link to="/job-prep" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm mb-4">
                    <ArrowLeft size={16} /> Back to Hub
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">{domainId?.replace('-', ' ')} Preparation</h1>
                <p className="text-gray-500">Select a module to start training.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {modules.map((module) => {
                        const Icon = getIcon(module.type);
                        const isAiTutor = module.type === 'ai-tutor';
                        
                        return (
                            <div key={module.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                                {isAiTutor && <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-100 to-transparent w-24 h-full opacity-50"></div>}
                                
                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isAiTutor ? 'bg-purple-100 text-purple-600' : 'bg-brand-50 text-brand-600'}`}>
                                        <Icon size={24} />
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded border ${
                                        module.difficulty === 'Hard' ? 'bg-red-50 text-red-600 border-red-100' : 
                                        module.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 
                                        'bg-green-50 text-green-600 border-green-100'
                                    }`}>
                                        {module.difficulty}
                                    </span>
                                </div>
                                
                                <h3 className="font-bold text-gray-900 text-lg mb-2 relative z-10">{module.title}</h3>
                                <p className="text-gray-500 text-sm mb-6 relative z-10">{module.description}</p>
                                
                                <div className="relative z-10">
                                    {module.id === 'comm-1' ? (
                                        <Link to="/job-prep/english-tutor" className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
                                            <Mic size={18} /> Start AI Session
                                        </Link>
                                    ) : (
                                        <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                                            <Play size={18} /> Start Module
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
};
