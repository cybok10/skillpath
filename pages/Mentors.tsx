import React from 'react';
import { Layout } from '../components/Layout';
import { Star, Briefcase, ExternalLink, MessageCircle } from 'lucide-react';
import { Mentor } from '../types';

const MOCK_MENTORS: Mentor[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Senior Frontend Engineer',
    company: 'Google',
    skills: ['React', 'TypeScript', 'System Design'],
    rating: 4.9,
    reviews: 124,
    imageUrl: 'https://picsum.photos/200',
    hourlyRate: 120
  },
  {
    id: '2',
    name: 'David Miller',
    title: 'Product Manager',
    company: 'Spotify',
    skills: ['Product Strategy', 'Agile', 'UX'],
    rating: 4.8,
    reviews: 89,
    imageUrl: 'https://picsum.photos/201',
    hourlyRate: 150
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    title: 'Data Scientist',
    company: 'Netflix',
    skills: ['Python', 'Machine Learning', 'SQL'],
    rating: 5.0,
    reviews: 56,
    imageUrl: 'https://picsum.photos/202',
    hourlyRate: 180
  },
  {
    id: '4',
    name: 'James Wilson',
    title: 'DevOps Engineer',
    company: 'Amazon',
    skills: ['AWS', 'Docker', 'Kubernetes'],
    rating: 4.7,
    reviews: 42,
    imageUrl: 'https://picsum.photos/203',
    hourlyRate: 110
  }
];

export const Mentors: React.FC = () => {
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Find Your Mentor</h1>
        <p className="text-gray-500">Connect with industry experts for personalized guidance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_MENTORS.map((mentor) => (
          <div key={mentor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-4">
                <img src={mentor.imageUrl} alt={mentor.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <h3 className="font-bold text-gray-900">{mentor.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Briefcase size={12} />
                    {mentor.title} at {mentor.company}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-yellow-700">{mentor.rating}</span>
                <span className="text-[10px] text-yellow-600">({mentor.reviews})</span>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {mentor.skills.map(skill => (
                <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
              <div>
                <span className="block text-xs text-gray-400">Rate</span>
                <span className="font-bold text-gray-900">${mentor.hourlyRate}<span className="text-xs font-normal text-gray-500">/hr</span></span>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                    <MessageCircle size={20} />
                 </button>
                 <button className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg shadow hover:bg-brand-700 transition-colors">
                    Book Session
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};
