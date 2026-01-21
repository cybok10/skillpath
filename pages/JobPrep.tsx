
import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { Code, MessageCircle, Brain, Database, Shield, Smartphone, PenTool, TrendingUp, Users } from 'lucide-react';
import { JobDomain } from '../types';

const JOB_DOMAINS: JobDomain[] = [
    { id: 'communication', title: 'Communication Skills', description: 'Master verbal and non-verbal communication, public speaking, and English fluency.', icon: 'MessageCircle', category: 'Non-Tech' },
    { id: 'fullstack', title: 'Full Stack Dev', description: 'End-to-end web development with React, Node.js, and Databases.', icon: 'Code', category: 'Tech' },
    { id: 'aptitude', title: 'Aptitude & Reasoning', description: 'Numerical ability, logical reasoning, and problem-solving for interviews.', icon: 'Brain', category: 'Aptitude' },
    { id: 'datascience', title: 'Data Science', description: 'Python, SQL, Machine Learning, and Data Visualization mastery.', icon: 'Database', category: 'Tech' },
    { id: 'cybersecurity', title: 'Cybersecurity', description: 'Network security, ethical hacking, and information protection.', icon: 'Shield', category: 'Tech' },
    { id: 'appdev', title: 'Mobile App Dev', description: 'Build iOS and Android applications using Flutter or React Native.', icon: 'Smartphone', category: 'Tech' },
    { id: 'uxui', title: 'UI/UX Design', description: 'User interface design, prototyping, and user experience research.', icon: 'PenTool', category: 'Tech' },
    { id: 'interview', title: 'HR Interview Prep', description: 'Behavioral questions, resume building, and mock HR rounds.', icon: 'Users', category: 'Non-Tech' },
];

export const JobPrep: React.FC = () => {
    
    const getIcon = (name: string) => {
        switch(name) {
            case 'Code': return Code;
            case 'MessageCircle': return MessageCircle;
            case 'Brain': return Brain;
            case 'Database': return Database;
            case 'Shield': return Shield;
            case 'Smartphone': return Smartphone;
            case 'PenTool': return PenTool;
            case 'Users': return Users;
            default: return TrendingUp;
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Job Preparation Hub</h1>
                <p className="text-gray-500">Master the skills required to crack your dream job.</p>
            </div>

            <div className="space-y-8">
                {/* Tech Domains */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Code className="text-blue-500" size={20} /> Technical Domains
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {JOB_DOMAINS.filter(d => d.category === 'Tech').map(domain => {
                            const Icon = getIcon(domain.icon);
                            return (
                                <Link to={`/job-prep/${domain.id}`} key={domain.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all group">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-2">{domain.title}</h3>
                                    <p className="text-gray-500 text-sm">{domain.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Non-Tech & Soft Skills */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MessageCircle className="text-purple-500" size={20} /> Communication & Soft Skills
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {JOB_DOMAINS.filter(d => d.category === 'Non-Tech').map(domain => {
                            const Icon = getIcon(domain.icon);
                            return (
                                <Link to={`/job-prep/${domain.id}`} key={domain.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all group">
                                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-2">{domain.title}</h3>
                                    <p className="text-gray-500 text-sm">{domain.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Aptitude */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Brain className="text-orange-500" size={20} /> Aptitude & Reasoning
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {JOB_DOMAINS.filter(d => d.category === 'Aptitude').map(domain => {
                            const Icon = getIcon(domain.icon);
                            return (
                                <Link to={`/job-prep/${domain.id}`} key={domain.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all group">
                                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-2">{domain.title}</h3>
                                    <p className="text-gray-500 text-sm">{domain.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
