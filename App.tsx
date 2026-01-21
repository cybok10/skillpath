
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Roadmap } from './pages/Roadmap';
import { Chatbot } from './pages/Chatbot';
import { Mentors } from './pages/Mentors';
import { Flashcards } from './pages/Flashcards';
import { Onboarding } from './pages/Onboarding';
import { Profile } from './pages/Profile';
import { JobPrep } from './pages/JobPrep';
import { JobPrepDomain } from './pages/JobPrepDomain';
import { EnglishTutor } from './pages/EnglishTutor';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/job-prep" element={<JobPrep />} />
        <Route path="/job-prep/english-tutor" element={<EnglishTutor />} />
        <Route path="/job-prep/:domainId" element={<JobPrepDomain />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<div className="p-8">Settings (Coming Soon)</div>} />
      </Routes>
    </HashRouter>
  );
};

export default App;
