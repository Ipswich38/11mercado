import { FeatureVector } from '../orchestrator/types';
import { EventBus } from '../events/EventBus';

/**
 * Feature Store - Manages user features, behavioral patterns, and ML training data
 * Supports real-time feature serving and offline feature computation
 */
export class FeatureStore {
  private eventBus: EventBus;
  private featureStorage: Map<string, UserFeatures> = new Map();
  private realtimeFeatures: Map<string, RealtimeFeatures> = new Map();
  private featureDefinitions: Map<string, FeatureDefinition> = new Map();
  private computeScheduler: FeatureComputeScheduler;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.computeScheduler = new FeatureComputeScheduler(this);
  }

  async initialize(): Promise<void> {
    console.log('🗄️  Initializing Feature Store...');
    
    // Register feature definitions
    await this.registerFeatureDefinitions();
    
    // Start background feature computation
    await this.computeScheduler.start();
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('✅ Feature Store initialized with', this.featureDefinitions.size, 'feature definitions');
  }

  /**
   * Store feature vector for a user
   */
  async storeFeatures(userId: string, features: FeatureVector): Promise<void> {
    try {
      const existingFeatures = this.featureStorage.get(userId) || {
        userId,
        lastUpdated: new Date(),
        behaviorFeatures: {},
        contextFeatures: {},
        interactionFeatures: {},
        mentalHealthFeatures: {},
        computedFeatures: {}
      };

      // Update with new features
      const updatedFeatures: UserFeatures = {
        ...existingFeatures,
        lastUpdated: new Date(),
        behaviorFeatures: {
          ...existingFeatures.behaviorFeatures,
          ...this.extractBehaviorFeatures(features)
        },
        contextFeatures: {
          ...existingFeatures.contextFeatures,
          ...this.extractContextFeatures(features)
        },
        interactionFeatures: {
          ...existingFeatures.interactionFeatures,
          ...this.extractInteractionFeatures(features)
        },
        mentalHealthFeatures: {
          ...existingFeatures.mentalHealthFeatures,
          ...this.extractMentalHealthFeatures(features)
        }
      };

      this.featureStorage.set(userId, updatedFeatures);

      // Emit feature update event
      this.eventBus.emit('features.updated', {
        userId,
        timestamp: new Date(),
        featureTypes: Object.keys(features.features)
      });

      console.log(`📊 Features stored for user ${userId}`);

    } catch (error) {
      console.error(`❌ Failed to store features for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user features for ML inference
   */
  async getUserFeatures(userId: string): Promise<UserBehaviorFeatures> {
    const features = this.featureStorage.get(userId);
    
    if (!features) {
      // Return default features for new users
      return this.getDefaultUserFeatures();
    }

    // Check if features are stale (older than 1 hour)
    const isStale = new Date().getTime() - features.lastUpdated.getTime() > 3600000;
    
    if (isStale) {
      // Trigger background feature computation
      await this.computeScheduler.scheduleComputation(userId);
    }

    return {
      engagementScore: features.behaviorFeatures.engagementScore || 0.5,
      sessionDuration: features.behaviorFeatures.averageSessionDuration || 300,
      responseQuality: features.behaviorFeatures.responseQualityScore || 0.7,
      topicPreferences: features.behaviorFeatures.topicPreferences || []
    };
  }

  /**
   * Get realtime features (computed on-the-fly)
   */
  async getRealtimeFeatures(userId: string, context: RealtimeContext): Promise<RealtimeFeatures> {
    const cacheKey = `${userId}_${context.sessionId}`;
    
    // Check cache first
    const cachedFeatures = this.realtimeFeatures.get(cacheKey);
    if (cachedFeatures && this.isCacheFresh(cachedFeatures, 300)) { // 5 min cache
      return cachedFeatures;
    }

    // Compute realtime features
    const realtimeFeatures: RealtimeFeatures = {
      userId,
      sessionId: context.sessionId,
      computedAt: new Date(),
      features: {
        currentSentiment: await this.computeCurrentSentiment(userId, context),
        conversationFlow: await this.computeConversationFlow(userId, context),
        urgencyLevel: await this.computeUrgencyLevel(userId, context),
        contextualRelevance: await this.computeContextualRelevance(userId, context),
        riskIndicators: await this.computeRiskIndicators(userId, context)
      }
    };

    // Cache the computed features
    this.realtimeFeatures.set(cacheKey, realtimeFeatures);

    return realtimeFeatures;
  }

  /**
   * Get features for model training (batch processing)
   */
  async getBatchFeatures(
    userIds: string[], 
    timeRange: { start: Date; end: Date }
  ): Promise<BatchFeatureSet> {
    console.log(`📊 Computing batch features for ${userIds.length} users`);

    const batchFeatures: BatchFeatureSet = {
      users: [],
      computedAt: new Date(),
      timeRange,
      schema: await this.getFeatureSchema()
    };

    for (const userId of userIds) {
      const userFeatures = this.featureStorage.get(userId);
      if (userFeatures && this.isInTimeRange(userFeatures.lastUpdated, timeRange)) {
        
        // Convert to training format
        const trainingFeatures = await this.convertToTrainingFormat(userFeatures);
        batchFeatures.users.push({
          userId,
          features: trainingFeatures,
          labels: await this.getUserLabels(userId, timeRange)
        });
      }
    }

    console.log(`✅ Batch features computed for ${batchFeatures.users.length} users`);
    return batchFeatures;
  }

  /**
   * Compute aggregated features across users (for population insights)
   */
  async computeAggregateFeatures(timeWindow: string): Promise<AggregateFeatures> {
    const allUsers = Array.from(this.featureStorage.keys());
    const aggregates: AggregateFeatures = {
      timeWindow,
      computedAt: new Date(),
      userCount: allUsers.length,
      averageEngagement: 0,
      topTopics: [],
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
      behaviorPatterns: []
    };

    // Compute aggregates
    let totalEngagement = 0;
    const topicCounts: Map<string, number> = new Map();
    const riskLevels: Map<string, number> = new Map(['low', 'medium', 'high', 'critical'].map(k => [k, 0]));

    for (const userId of allUsers) {
      const userFeatures = this.featureStorage.get(userId);
      if (userFeatures) {
        totalEngagement += userFeatures.behaviorFeatures.engagementScore || 0;
        
        // Count topics
        (userFeatures.behaviorFeatures.topicPreferences || []).forEach(topic => {
          topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
        });
        
        // Count risk levels
        const riskLevel = userFeatures.mentalHealthFeatures.riskLevel || 'low';
        riskLevels.set(riskLevel, riskLevels.get(riskLevel)! + 1);
      }
    }

    aggregates.averageEngagement = allUsers.length > 0 ? totalEngagement / allUsers.length : 0;
    
    // Top topics
    aggregates.topTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    // Risk distribution
    aggregates.riskDistribution = {
      low: riskLevels.get('low')! / allUsers.length,
      medium: riskLevels.get('medium')! / allUsers.length,
      high: riskLevels.get('high')! / allUsers.length,
      critical: riskLevels.get('critical')! / allUsers.length
    };

    return aggregates;
  }

  /**
   * Register a feature transformation pipeline
   */
  async registerFeatureTransform(definition: FeatureTransform): Promise<void> {
    console.log(`📝 Registering feature transform: ${definition.name}`);
    
    // Store transform definition
    this.featureDefinitions.set(definition.name, {
      name: definition.name,
      type: 'transform',
      inputFeatures: definition.inputFeatures,
      outputFeature: definition.outputFeature,
      transform: definition.transform,
      schedule: definition.schedule || 'realtime'
    });

    // If scheduled, add to compute scheduler
    if (definition.schedule && definition.schedule !== 'realtime') {
      this.computeScheduler.addScheduledComputation(definition);
    }
  }

  // Private methods
  private async registerFeatureDefinitions(): Promise<void> {
    // User behavior features
    await this.registerFeatureTransform({
      name: 'engagement_score',
      inputFeatures: ['interaction_count', 'session_duration', 'response_rating'],
      outputFeature: 'engagementScore',
      transform: (inputs: Record<string, number>) => {
        const { interaction_count = 0, session_duration = 0, response_rating = 0 } = inputs;
        return (interaction_count * 0.3 + (session_duration / 3600) * 0.4 + response_rating * 0.3);
      },
      schedule: 'hourly'
    });

    // Mental health indicators
    await this.registerFeatureTransform({
      name: 'stress_level',
      inputFeatures: ['sentiment_score', 'urgency_keywords', 'response_time'],
      outputFeature: 'stressLevel',
      transform: (inputs: Record<string, number>) => {
        const { sentiment_score = 0, urgency_keywords = 0, response_time = 0 } = inputs;
        const stressIndicator = (1 - sentiment_score) * 0.5 + urgency_keywords * 0.3 + 
                               (response_time > 1000 ? 0.2 : 0);
        return Math.min(stressIndicator, 1.0);
      },
      schedule: 'realtime'
    });

    // Topic preferences
    await this.registerFeatureTransform({
      name: 'topic_preferences',
      inputFeatures: ['topic_interactions', 'topic_durations', 'topic_ratings'],
      outputFeature: 'topicPreferences',
      transform: (inputs: Record<string, any>) => {
        const { topic_interactions = {}, topic_ratings = {} } = inputs;
        return Object.keys(topic_interactions)
          .map(topic => ({
            topic,
            score: (topic_interactions[topic] || 0) * 0.6 + (topic_ratings[topic] || 0) * 0.4
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map(t => t.topic);
      },
      schedule: 'daily'
    });

    console.log('✅ Feature definitions registered');
  }

  private setupEventListeners(): void {
    // Listen for interaction events to update features
    this.eventBus.on('interaction.logged', async (event: any) => {
      try {
        await this.updateInteractionFeatures(event.userId, event);
      } catch (error) {
        console.error('❌ Failed to update interaction features:', error);
      }
    });

    // Listen for feedback events
    this.eventBus.on('feedback.received', async (event: any) => {
      try {
        await this.updateFeedbackFeatures(event.userId, event);
      } catch (error) {
        console.error('❌ Failed to update feedback features:', error);
      }
    });

    console.log('👂 Feature Store event listeners setup');
  }

  private extractBehaviorFeatures(features: FeatureVector): BehaviorFeatures {
    const behavior = features.features.userBehavior;
    if (!behavior) return {};

    return {
      engagementScore: behavior.engagementScore,
      averageSessionDuration: behavior.sessionDuration,
      responseQualityScore: behavior.responseQuality,
      topicPreferences: behavior.topicPreferences || []
    };
  }

  private extractContextFeatures(features: FeatureVector): ContextFeatures {
    return {
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      deviceType: 'web', // Could be extracted from user agent
      location: 'unknown' // Would require geo-location
    };
  }

  private extractInteractionFeatures(features: FeatureVector): InteractionFeatures {
    return {
      queryLength: features.features.textEmbedding?.length || 0,
      responseTime: 0, // Would be calculated during interaction
      topicCategories: [] // Would be extracted from query analysis
    };
  }

  private extractMentalHealthFeatures(features: FeatureVector): MentalHealthFeatures {
    const mhFeatures = features.features.mentalHealthIndicators;
    if (!mhFeatures) return {};

    return {
      sentimentScore: mhFeatures.sentimentScore,
      stressLevel: mhFeatures.anxietyLevel,
      riskLevel: mhFeatures.supportNeeded ? 'medium' : 'low',
      supportKeywords: mhFeatures.stressIndicators || []
    };
  }

  private getDefaultUserFeatures(): UserBehaviorFeatures {
    return {
      engagementScore: 0.5,
      sessionDuration: 300,
      responseQuality: 0.7,
      topicPreferences: []
    };
  }

  private isCacheFresh(features: RealtimeFeatures, maxAgeSeconds: number): boolean {
    const ageMs = new Date().getTime() - features.computedAt.getTime();
    return ageMs < (maxAgeSeconds * 1000);
  }

  // Realtime feature computation methods
  private async computeCurrentSentiment(userId: string, context: RealtimeContext): Promise<number> {
    // Mock sentiment computation - in production, use actual NLP model
    const messages = context.conversationHistory || [];
    if (messages.length === 0) return 0.5;

    const lastMessage = messages[messages.length - 1];
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'horrible', 'stressed'];

    const content = lastMessage.content.toLowerCase();
    let sentiment = 0.5; // Neutral

    positiveWords.forEach(word => {
      if (content.includes(word)) sentiment += 0.1;
    });
    
    negativeWords.forEach(word => {
      if (content.includes(word)) sentiment -= 0.1;
    });

    return Math.max(0, Math.min(1, sentiment));
  }

  private async computeConversationFlow(userId: string, context: RealtimeContext): Promise<number> {
    const messages = context.conversationHistory || [];
    if (messages.length < 2) return 0.5;

    // Analyze conversation coherence and flow
    let flowScore = 0.7; // Base score
    
    // Check for topic consistency
    const topics = messages.map(m => this.extractTopics(m.content));
    const topicOverlap = this.calculateTopicOverlap(topics);
    
    flowScore = flowScore * 0.7 + topicOverlap * 0.3;
    
    return Math.max(0, Math.min(1, flowScore));
  }

  private async computeUrgencyLevel(userId: string, context: RealtimeContext): Promise<number> {
    const messages = context.conversationHistory || [];
    if (messages.length === 0) return 0.1;

    const urgentKeywords = ['urgent', 'emergency', 'crisis', 'help', 'immediately', 'now'];
    const lastMessage = messages[messages.length - 1];
    
    let urgencyScore = 0.1;
    urgentKeywords.forEach(keyword => {
      if (lastMessage.content.toLowerCase().includes(keyword)) {
        urgencyScore += 0.2;
      }
    });

    return Math.min(1, urgencyScore);
  }

  private async computeContextualRelevance(userId: string, context: RealtimeContext): Promise<number> {
    // Mock contextual relevance based on time and user history
    const hour = new Date().getHours();
    let relevance = 0.7;

    // Study hours (more relevant for educational content)
    if (hour >= 9 && hour <= 17) {
      relevance += 0.2;
    }

    // Late night (higher mental health relevance)
    if (hour >= 22 || hour <= 6) {
      relevance += 0.1;
    }

    return Math.min(1, relevance);
  }

  private async computeRiskIndicators(userId: string, context: RealtimeContext): Promise<RiskIndicators> {
    const messages = context.conversationHistory || [];
    const riskKeywords = ['suicide', 'kill', 'die', 'hurt', 'harm', 'hopeless'];
    
    let riskScore = 0;
    const detectedKeywords: string[] = [];

    messages.forEach(message => {
      const content = message.content.toLowerCase();
      riskKeywords.forEach(keyword => {
        if (content.includes(keyword)) {
          riskScore += 0.3;
          detectedKeywords.push(keyword);
        }
      });
    });

    return {
      overallRisk: Math.min(1, riskScore),
      detectedKeywords,
      requiresIntervention: riskScore > 0.5
    };
  }

  private extractTopics(content: string): string[] {
    // Mock topic extraction - in production, use NLP models
    const topics = ['education', 'mental_health', 'stress', 'relationships', 'career'];
    return topics.filter(topic => content.toLowerCase().includes(topic));
  }

  private calculateTopicOverlap(topicSets: string[][]): number {
    if (topicSets.length < 2) return 1.0;
    
    const firstSet = new Set(topicSets[0]);
    const overlaps = topicSets.slice(1).map(topics => {
      const currentSet = new Set(topics);
      const intersection = new Set([...firstSet].filter(x => currentSet.has(x)));
      const union = new Set([...firstSet, ...currentSet]);
      return union.size > 0 ? intersection.size / union.size : 0;
    });
    
    return overlaps.reduce((sum, overlap) => sum + overlap, 0) / overlaps.length;
  }

  private async updateInteractionFeatures(userId: string, event: any): Promise<void> {
    const features = this.featureStorage.get(userId) || this.createEmptyUserFeatures(userId);
    
    // Update interaction count
    features.interactionFeatures.totalInteractions = (features.interactionFeatures.totalInteractions || 0) + 1;
    
    // Update average query length
    if (event.query) {
      const currentAvg = features.interactionFeatures.averageQueryLength || 0;
      const count = features.interactionFeatures.totalInteractions;
      features.interactionFeatures.averageQueryLength = 
        ((currentAvg * (count - 1)) + event.query.length) / count;
    }

    this.featureStorage.set(userId, features);
  }

  private async updateFeedbackFeatures(userId: string, event: any): Promise<void> {
    const features = this.featureStorage.get(userId) || this.createEmptyUserFeatures(userId);
    
    // Update response quality score
    if (event.rating) {
      const currentScore = features.behaviorFeatures.responseQualityScore || 0.5;
      const newScore = event.rating / 5.0; // Normalize to 0-1
      features.behaviorFeatures.responseQualityScore = (currentScore * 0.8) + (newScore * 0.2);
    }

    this.featureStorage.set(userId, features);
  }

  private createEmptyUserFeatures(userId: string): UserFeatures {
    return {
      userId,
      lastUpdated: new Date(),
      behaviorFeatures: {},
      contextFeatures: {},
      interactionFeatures: {},
      mentalHealthFeatures: {},
      computedFeatures: {}
    };
  }

  private isInTimeRange(date: Date, range: { start: Date; end: Date }): boolean {
    return date >= range.start && date <= range.end;
  }

  private async getFeatureSchema(): Promise<FeatureSchema> {
    return {
      behavioral: ['engagementScore', 'sessionDuration', 'responseQuality'],
      contextual: ['timeOfDay', 'dayOfWeek', 'deviceType'],
      interaction: ['queryLength', 'responseTime', 'topicCategories'],
      mentalHealth: ['sentimentScore', 'stressLevel', 'riskLevel']
    };
  }

  private async convertToTrainingFormat(features: UserFeatures): Promise<TrainingFeatures> {
    return {
      behavioral: [
        features.behaviorFeatures.engagementScore || 0,
        features.behaviorFeatures.averageSessionDuration || 0,
        features.behaviorFeatures.responseQualityScore || 0
      ],
      contextual: [
        features.contextFeatures.timeOfDay || 12,
        features.contextFeatures.dayOfWeek || 0
      ],
      interaction: [
        features.interactionFeatures.averageQueryLength || 0,
        features.interactionFeatures.totalInteractions || 0
      ],
      mentalHealth: [
        features.mentalHealthFeatures.sentimentScore || 0.5,
        features.mentalHealthFeatures.stressLevel || 0
      ]
    };
  }

  private async getUserLabels(userId: string, timeRange: { start: Date; end: Date }): Promise<UserLabels> {
    // Mock labels - in production, derive from actual user outcomes
    return {
      satisfactionScore: 0.8,
      engagementLevel: 'high',
      riskLevel: 'low',
      preferredTopics: ['education', 'mental_health']
    };
  }
}

// Feature computation scheduler
class FeatureComputeScheduler {
  private featureStore: FeatureStore;
  private scheduledComputations: Map<string, FeatureTransform> = new Map();
  private isRunning = false;

  constructor(featureStore: FeatureStore) {
    this.featureStore = featureStore;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Run scheduled computations every minute
    setInterval(() => {
      this.runScheduledComputations();
    }, 60 * 1000);
    
    console.log('⏰ Feature compute scheduler started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('⏸️  Feature compute scheduler stopped');
  }

  addScheduledComputation(transform: FeatureTransform): void {
    this.scheduledComputations.set(transform.name, transform);
  }

  async scheduleComputation(userId: string): Promise<void> {
    // Queue user for feature recomputation
    console.log(`📊 Scheduling feature computation for user ${userId}`);
    // In production, add to job queue
  }

  private async runScheduledComputations(): Promise<void> {
    if (!this.isRunning) return;

    for (const [name, transform] of this.scheduledComputations) {
      try {
        if (this.shouldRunComputation(transform)) {
          await this.runFeatureTransform(transform);
        }
      } catch (error) {
        console.error(`❌ Failed to run scheduled computation ${name}:`, error);
      }
    }
  }

  private shouldRunComputation(transform: FeatureTransform): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    switch (transform.schedule) {
      case 'hourly':
        return minute === 0;
      case 'daily':
        return hour === 2 && minute === 0; // Run at 2 AM
      case 'weekly':
        return now.getDay() === 0 && hour === 2 && minute === 0; // Sunday 2 AM
      default:
        return false;
    }
  }

  private async runFeatureTransform(transform: FeatureTransform): Promise<void> {
    console.log(`🔄 Running scheduled computation: ${transform.name}`);
    // In production, implement actual feature transformation
  }
}

// Supporting interfaces
export interface UserBehaviorFeatures {
  engagementScore: number;
  sessionDuration: number;
  responseQuality: number;
  topicPreferences: string[];
}

interface UserFeatures {
  userId: string;
  lastUpdated: Date;
  behaviorFeatures: BehaviorFeatures;
  contextFeatures: ContextFeatures;
  interactionFeatures: InteractionFeatures;
  mentalHealthFeatures: MentalHealthFeatures;
  computedFeatures: Record<string, any>;
}

interface BehaviorFeatures {
  engagementScore?: number;
  averageSessionDuration?: number;
  responseQualityScore?: number;
  topicPreferences?: string[];
}

interface ContextFeatures {
  timeOfDay?: number;
  dayOfWeek?: number;
  deviceType?: string;
  location?: string;
}

interface InteractionFeatures {
  totalInteractions?: number;
  averageQueryLength?: number;
  responseTime?: number;
  topicCategories?: string[];
}

interface MentalHealthFeatures {
  sentimentScore?: number;
  stressLevel?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  supportKeywords?: string[];
}

interface RealtimeFeatures {
  userId: string;
  sessionId: string;
  computedAt: Date;
  features: {
    currentSentiment: number;
    conversationFlow: number;
    urgencyLevel: number;
    contextualRelevance: number;
    riskIndicators: RiskIndicators;
  };
}

interface RealtimeContext {
  sessionId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  currentQuery?: string;
  userContext?: Record<string, any>;
}

interface RiskIndicators {
  overallRisk: number;
  detectedKeywords: string[];
  requiresIntervention: boolean;
}

interface BatchFeatureSet {
  users: Array<{
    userId: string;
    features: TrainingFeatures;
    labels: UserLabels;
  }>;
  computedAt: Date;
  timeRange: { start: Date; end: Date };
  schema: FeatureSchema;
}

interface TrainingFeatures {
  behavioral: number[];
  contextual: number[];
  interaction: number[];
  mentalHealth: number[];
}

interface UserLabels {
  satisfactionScore: number;
  engagementLevel: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  preferredTopics: string[];
}

interface FeatureSchema {
  behavioral: string[];
  contextual: string[];
  interaction: string[];
  mentalHealth: string[];
}

interface AggregateFeatures {
  timeWindow: string;
  computedAt: Date;
  userCount: number;
  averageEngagement: number;
  topTopics: Array<{ topic: string; count: number }>;
  riskDistribution: { low: number; medium: number; high: number; critical: number };
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  behaviorPatterns: string[];
}

interface FeatureDefinition {
  name: string;
  type: 'transform' | 'aggregation' | 'lookup';
  inputFeatures: string[];
  outputFeature: string;
  transform?: (inputs: Record<string, any>) => any;
  schedule: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

interface FeatureTransform {
  name: string;
  inputFeatures: string[];
  outputFeature: string;
  transform: (inputs: Record<string, any>) => any;
  schedule?: 'realtime' | 'hourly' | 'daily' | 'weekly';
}