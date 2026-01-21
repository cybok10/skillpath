
export enum UserRole {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile?: StudentProfile;
  // Gamification
  xp: number;
  level: number;
  streak: number;
  globalRank: number;
  joinDate: string;
  profilePictureUrl?: string;
}

export interface StudentProfile {
  careerGoal: string;
  currentSkills: string[]; // Legacy, kept for compatibility
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  weeklyHours: number;
  role?: string;
  experienceLevel?: string;
  preferredTech?: string[];
  currentProject?: string;
  aspiration?: string;
  bio?: string;
}

export interface SkillStat {
  id: number;
  skillName: string;
  category: 'Programming' | 'Networking' | 'Cybersecurity' | 'Web' | 'AI_Data';
  score: number; // 0-100
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ActivityLog {
  id: number;
  activityType: 'COURSE' | 'LAB' | 'QUIZ' | 'PROJECT';
  title: string;
  xpEarned: number;
  timestamp: string;
  skillTag: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  awardedAt: string;
}

export interface CareerReadiness {
  score: number; // 0-100
  missingSkills: string[];
  targetRole: string;
  readinessLevel: 'Low' | 'Moderate' | 'High' | 'Job Ready';
}

// Composite DTO for the Profile Page
export interface FullProfileDTO {
  user: User;
  skills: SkillStat[];
  recentActivity: ActivityLog[];
  badges: Badge[];
  careerReadiness: CareerReadiness;
  stats: {
    totalLearningHours: number;
    coursesCompleted: number;
    labsCompleted: number;
  };
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  resources: Resource[];
  estimatedHours: number;
}

export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'project';
}

export interface Roadmap {
  goal: string;
  milestones: Milestone[];
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  skills: string[];
  rating: number;
  reviews: number;
  imageUrl: string;
  hourlyRate: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

// Job Preparation Interfaces
export interface JobDomain {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  category: 'Tech' | 'Non-Tech' | 'Aptitude';
}

export interface JobModule {
  id: string;
  domainId: string;
  title: string;
  description: string;
  type: 'learning' | 'practice' | 'ai-tutor';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}
