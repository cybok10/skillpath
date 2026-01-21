export type QuestionType = 'text' | 'select' | 'multiselect' | 'textarea' | 'cards';

export interface Option {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
}

export interface Question {
  id: string;
  title: string;
  subtitle: string;
  type: QuestionType;
  options?: Option[];
  placeholder?: string;
  validation?: (value: any) => boolean;
}

export const QUESTIONS: Question[] = [
  {
    id: 'name',
    title: "Welcome! What's your name?",
    subtitle: "Let's get to know each other.",
    type: 'text',
    placeholder: "Your Name",
    validation: (value: string) => value.length > 0
  },
  {
    id: 'role',
    title: "What describes you best?",
    subtitle: "This helps us tailor the language we use.",
    type: 'select',
    options: [
      { value: 'student', label: 'Student', emoji: '🎓', description: 'Currently enrolled in school' },
      { value: 'professional', label: 'Professional', emoji: '💼', description: 'Working in the industry' },
      { value: 'switcher', label: 'Career Switcher', emoji: '🔄', description: 'Moving to tech' },
      { value: 'hobbyist', label: 'Hobbyist', emoji: '🎨', description: 'Learning for fun' }
    ]
  },
  {
    id: 'careerGoal',
    title: "What is your main goal?",
    subtitle: "We'll build your roadmap around this.",
    type: 'select',
    options: [
      { value: 'frontend', label: 'Frontend Developer', emoji: '💻' },
      { value: 'backend', label: 'Backend Developer', emoji: '⚙️' },
      { value: 'fullstack', label: 'Full Stack Developer', emoji: '🚀' },
      { value: 'datascience', label: 'Data Scientist', emoji: '📊' },
      { value: 'mobile', label: 'Mobile Developer', emoji: '📱' },
      { value: 'uxui', label: 'UX/UI Designer', emoji: '🎨' }
    ]
  },
  {
    id: 'experienceLevel',
    title: "How experienced are you?",
    subtitle: "Be honest! It helps us find the right resources.",
    type: 'select',
    options: [
      { value: 'beginner', label: 'Beginner', description: 'Just starting out', emoji: '🌱' },
      { value: 'intermediate', label: 'Intermediate', description: 'Built a few projects', emoji: '🌿' },
      { value: 'advanced', label: 'Advanced', description: 'Professional experience', emoji: '🌳' }
    ]
  },
  {
    id: 'preferredTech',
    title: "Any tech you want to focus on?",
    subtitle: "Select all that apply (Optional).",
    type: 'multiselect',
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'nextjs', label: 'Next.js' },
      { value: 'node', label: 'Node.js' },
      { value: 'python', label: 'Python' },
      { value: 'java', label: 'Java' },
      { value: 'aws', label: 'AWS' },
      { value: 'flutter', label: 'Flutter' }
    ]
  },
  {
    id: 'currentProject',
    title: "Are you working on anything?",
    subtitle: "Describe a current project or one you want to build.",
    type: 'textarea',
    placeholder: "I'm currently building a personal portfolio..."
  },
  {
    id: 'aspiration',
    title: "Long-term Career Aspirations",
    subtitle: "What is your ultimate career goal? Where do you want to be in 5 years?",
    type: 'textarea',
    placeholder: "I aspire to become a CTO of a fintech company...",
    validation: (value: string) => value.length > 5
  },
  {
    id: 'learningStyle',
    title: "How do you learn best?",
    subtitle: "We'll prioritize these types of resources.",
    type: 'cards',
    options: [
        { value: 'visual', label: 'Visual', emoji: '🎥', description: 'Videos & Diagrams' },
        { value: 'reading', label: 'Reading', emoji: '📚', description: 'Articles & Docs' },
        { value: 'kinesthetic', label: 'Hands-on', emoji: '🛠️', description: 'Projects & Labs' },
        { value: 'auditory', label: 'Auditory', emoji: '🎧', description: 'Podcasts & Discussions' },
    ]
  }
];