
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { QUESTIONS, Question, Option } from './onboardingQuestions';
import { authService } from '../services/authService';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  
  // SESSION STORAGE LOGIC:
  // We use sessionStorage (cleared when tab closes) to persist progress during this specific session.
  // This prevents losing data on accidental refresh.
  
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    try {
        const saved = sessionStorage.getItem('onboarding_step');
        return saved ? parseInt(saved, 10) : 0;
    } catch(e) { return 0; }
  });

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    try {
        const saved = sessionStorage.getItem('onboarding_data');
        return saved ? JSON.parse(saved) : { preferredTech: [] };
    } catch(e) { return { preferredTech: [] }; }
  });

  const [isSaving, setIsSaving] = useState(false);

  // Auto-save to Session Storage on change
  useEffect(() => {
    sessionStorage.setItem('onboarding_data', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    sessionStorage.setItem('onboarding_step', currentStepIndex.toString());
  }, [currentStepIndex]);

  const question = QUESTIONS[currentStepIndex];
  const isLastStep = currentStepIndex === QUESTIONS.length - 1;

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    if (isLastStep) {
      setIsSaving(true);
      try {
        // Save data via AuthService (Backend API)
        await authService.updateProfile(formData);
        
        // CRITICAL: Clear session storage on success so next user/session starts fresh
        sessionStorage.removeItem('onboarding_data');
        sessionStorage.removeItem('onboarding_step');

        // Artificial delay for UX
        setTimeout(() => {
          setIsSaving(false);
          navigate('/dashboard');
        }, 800);
      } catch (error) {
        console.error("Failed to save profile", error);
        setIsSaving(false);
        // Optionally handle error UI here
      }
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const isStepValid = () => {
    if (question.type === 'multiselect') return true; // Optional usually
    if (question.validation) {
        return question.validation(formData[question.id] || '');
    }
    // Default required check for other types
    if (question.type === 'text' || question.type === 'textarea') {
       return (formData[question.id] || '').length > 0;
    }
    return !!formData[question.id];
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            className="w-full px-4 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-0 outline-none transition-all"
            placeholder={question.placeholder}
            value={formData[question.id] || ''}
            onChange={(e) => updateField(question.id, e.target.value)}
            autoFocus
          />
        );
      case 'textarea':
        return (
          <textarea
            className="w-full h-32 px-4 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-0 outline-none transition-all resize-none"
            placeholder={question.placeholder}
            value={formData[question.id] || ''}
            onChange={(e) => updateField(question.id, e.target.value)}
            autoFocus
          />
        );
      case 'select':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options?.map((opt) => (
              <div
                key={opt.value}
                onClick={() => updateField(question.id, opt.value)}
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                  formData[question.id] === opt.value
                    ? 'border-brand-500 bg-brand-50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <div className={`font-medium ${formData[question.id] === opt.value ? 'text-brand-900' : 'text-gray-900'}`}>{opt.label}</div>
                  {opt.description && <div className="text-xs text-gray-500">{opt.description}</div>}
                </div>
                {formData[question.id] === opt.value && <Check size={20} className="ml-auto text-brand-600" />}
              </div>
            ))}
          </div>
        );
      case 'cards':
        return (
          <div className="grid grid-cols-2 gap-4">
            {question.options?.map((opt) => (
              <div
                key={opt.value}
                onClick={() => updateField(question.id, opt.value)}
                className={`p-6 rounded-xl border-2 cursor-pointer flex flex-col items-center text-center gap-2 transition-all ${
                  formData[question.id] === opt.value
                    ? 'border-brand-500 bg-brand-50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-4xl mb-2">{opt.emoji}</span>
                <div className={`font-bold ${formData[question.id] === opt.value ? 'text-brand-900' : 'text-gray-900'}`}>{opt.label}</div>
                {opt.description && <div className="text-xs text-gray-500">{opt.description}</div>}
              </div>
            ))}
          </div>
        );
      case 'multiselect':
        const selected = (formData[question.id] as string[]) || [];
        const toggle = (val: string) => {
          if (selected.includes(val)) {
            updateField(question.id, selected.filter(v => v !== val));
          } else {
            updateField(question.id, [...selected, val]);
          }
        };
        return (
          <div className="flex flex-wrap gap-3">
            {question.options?.map((opt) => {
              const isActive = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                    isActive
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Side - Visual */}
      <div className="hidden md:flex md:w-5/12 bg-brand-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-brand-900 font-bold">SP</div>
            <span className="font-bold text-lg tracking-wide">SkillPath AI</span>
          </div>
        </div>

        <div className="z-10 space-y-6">
           <h1 className="text-4xl font-extrabold leading-tight">
             {question.id === 'name' ? "Let's build your future." :
              question.id === 'aspiration' ? "Dream Big." : 
              "Customizing your journey..."}
           </h1>
           <p className="text-brand-200 text-lg opacity-90 max-w-sm">
             {question.id === 'aspiration' ? "Your aspirations help us connect you with the right mentors and long-term milestones." :
              "We use these details to generate a highly personalized learning roadmap and mentor matches tailored just for you."}
           </p>
        </div>

        {/* Progress Bar */}
        <div className="z-10">
           <div className="flex justify-between text-xs font-medium text-brand-200 mb-2">
             <span>Step {currentStepIndex + 1} of {QUESTIONS.length}</span>
             <span>{Math.round(((currentStepIndex + 1) / QUESTIONS.length) * 100)}%</span>
           </div>
           <div className="h-2 bg-brand-800 rounded-full overflow-hidden">
             <div 
               className="h-full bg-brand-400 transition-all duration-500 ease-out"
               style={{ width: `${((currentStepIndex + 1) / QUESTIONS.length) * 100}%` }}
             ></div>
           </div>
        </div>
      </div>

      {/* Right Side - Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-16 relative">
        <div className="w-full max-w-lg">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between mb-8">
                <span className="font-bold text-gray-800">SkillPath AI</span>
                <span className="text-xs font-medium text-gray-500">{currentStepIndex + 1}/{QUESTIONS.length}</span>
            </div>

            {/* Back Button */}
            {currentStepIndex > 0 && (
                <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
            )}

            {/* Question Content */}
            <div className="animate-fade-in-up">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{question.title}</h2>
                <p className="text-gray-500 mb-8 text-lg">{question.subtitle}</p>
                
                <div className="min-h-[200px]">
                    {renderInput()}
                </div>
            </div>

            {/* Navigation */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!isStepValid() || isSaving}
                    className="bg-brand-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Saving...
                        </>
                    ) : (
                        <>
                            {isLastStep ? 'Finish Setup' : 'Continue'}
                            {!isLastStep && <ArrowRight size={20} />}
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
