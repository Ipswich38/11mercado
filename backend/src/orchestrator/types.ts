// Core types for the AI Orchestrator system

export interface UserProfile {
  id: string;
  anonymizedHash: string;
  consentToTrain: boolean;
  stressScore?: number;
  recentEngagement?: number;
  lastInteraction?: Date;
  mentalHealthFlags?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    lastAssessment: Date;
    triggerWords?: string[];
  };
}

export interface QueryContext {
  userId: string;
  sessionId: string;
  query: string;
  timestamp: Date;
  userProfile: UserProfile;
  conversationHistory: Message[];
  realTimeContext: {
    timeOfDay: string;
    dayOfWeek: string;
    isExamPeriod?: boolean;
    userLocation?: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    modelUsed?: string;
    confidence?: number;
    safetyFlags?: SafetyFlags;
    citations?: string[];
  };
}

export interface SafetyFlags {
  selfHarm: boolean;
  suicidalLanguage: boolean;
  toxicity: boolean;
  confidenceScore: number;
  requiresEscalation: boolean;
  interventionRequired: boolean;
}

export interface RoutingDecision {
  modelId: string;
  version: string;
  pipeline: PipelineStep[];
  fallbackModel?: string;
  expectedLatencyMs: number;
  confidence: number;
  reasoningTrace: string[];
}

export interface PipelineStep {
  type: 'preprocessing' | 'safety' | 'model_call' | 'postprocessing' | 'escalation';
  processor: string;
  parameters: Record<string, any>;
  timeout: number;
}

export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  type: 'chat' | 'safety' | 'routing' | 'specialty';
  capabilities: string[];
  targetUseCase: string[];
  safetyRating: number;
  costPerToken: number;
  avgLatencyMs: number;
  deploymentStatus: 'canary' | 'shadow' | 'production';
}

export interface FeatureVector {
  userId: string;
  timestamp: Date;
  features: {
    textEmbedding?: number[];
    conversationalContext?: number[];
    userBehavior?: {
      engagementScore: number;
      sessionDuration: number;
      responseQuality: number;
      topicPreferences: string[];
    };
    mentalHealthIndicators?: {
      sentimentScore: number;
      anxietyLevel: number;
      stressIndicators: string[];
      supportNeeded: boolean;
    };
  };
}

export interface RoutingEvent {
  eventId: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  query: string;
  routingDecision: RoutingDecision;
  features: FeatureVector;
  safetyFlags: SafetyFlags;
  response: string;
  userFeedback?: {
    rating: number;
    helpful: boolean;
    categories: string[];
  };
  outcome: 'success' | 'escalation' | 'error' | 'timeout';
}

// Mental Health Specific Types
export interface CrisisDetection {
  level: 'none' | 'watch' | 'intervention' | 'emergency';
  indicators: string[];
  confidence: number;
  recommendedAction: 'continue' | 'escalate' | 'immediate_intervention';
  resources: {
    hotlines: Array<{
      name: string;
      number: string;
      country: string;
      available24h: boolean;
    }>;
    localServices: string[];
    emergencyContacts: string[];
  };
}

export interface TherapeuticResponse {
  content: string;
  approach: 'supportive' | 'cbt' | 'mindfulness' | 'referral';
  followUpSuggestions: string[];
  resourceRecommendations: string[];
  riskAssessment: CrisisDetection;
}