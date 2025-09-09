import { SafetyFlags, UserProfile, CrisisDetection } from '../orchestrator/types';
import { EventBus } from '../events/EventBus';

/**
 * Safety Processor - Critical safety and moderation system for mental health applications
 * Implements multiple layers of protection with real-time crisis detection
 */
export class SafetyProcessor {
  private eventBus: EventBus;
  private safetyModels: Map<string, SafetyModel> = new Map();
  private emergencyContacts: EmergencyContact[] = [];
  private moderationRules: ModerationRule[] = [];
  private humanReviewQueue: Map<string, ReviewQueueItem> = new Map();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  async initialize(): Promise<void> {
    console.log('🛡️  Initializing Safety Processor...');
    
    // Initialize safety models
    await this.initializeSafetyModels();
    
    // Load moderation rules
    await this.loadModerationRules();
    
    // Setup emergency contacts
    await this.setupEmergencyContacts();
    
    // Start human review monitoring
    this.startReviewMonitoring();
    
    console.log('✅ Safety Processor initialized with', this.safetyModels.size, 'safety models');
  }

  /**
   * Analyze input content for safety issues (pre-processing)
   */
  async analyzeInput(content: string, userProfile: UserProfile): Promise<SafetyFlags> {
    try {
      const startTime = Date.now();
      
      // Multi-layer safety analysis
      const [
        toxicityResult,
        selfHarmResult,
        suicidalResult,
        contextualResult
      ] = await Promise.all([
        this.analyzeToxicity(content),
        this.analyzeSelfHarm(content, userProfile),
        this.analyzeSuicidalLanguage(content, userProfile),
        this.analyzeContextualRisk(content, userProfile)
      ]);

      const safetyFlags: SafetyFlags = {
        selfHarm: selfHarmResult.detected,
        suicidalLanguage: suicidalResult.detected,
        toxicity: toxicityResult.detected,
        confidenceScore: this.calculateOverallConfidence([
          toxicityResult.confidence,
          selfHarmResult.confidence,
          suicidalResult.confidence,
          contextualResult.confidence
        ]),
        requiresEscalation: this.shouldEscalate([toxicityResult, selfHarmResult, suicidalResult, contextualResult]),
        interventionRequired: this.requiresImmediateIntervention([selfHarmResult, suicidalResult])
      };

      const processingTime = Date.now() - startTime;
      
      // Log safety analysis
      this.logSafetyAnalysis('input', content, safetyFlags, processingTime);
      
      // Handle immediate interventions
      if (safetyFlags.interventionRequired) {
        await this.triggerEmergencyIntervention(userProfile.id, content, safetyFlags);
      } else if (safetyFlags.requiresEscalation) {
        await this.escalateToHumanReview(userProfile.id, content, safetyFlags, 'input_analysis');
      }

      return safetyFlags;

    } catch (error) {
      console.error('❌ Input safety analysis failed:', error);
      
      // Return conservative safety flags on error
      return {
        selfHarm: false,
        suicidalLanguage: false,
        toxicity: false,
        confidenceScore: 0.0,
        requiresEscalation: true, // Escalate on analysis failure
        interventionRequired: false
      };
    }
  }

  /**
   * Analyze output content for safety issues (post-processing)
   */
  async analyzeOutput(content: string, userProfile: UserProfile): Promise<SafetyFlags> {
    try {
      const startTime = Date.now();
      
      // Analyze AI-generated response for safety issues
      const [
        harmfulAdviceResult,
        inappropriateContentResult,
        privacyLeakResult,
        professionalBoundariesResult
      ] = await Promise.all([
        this.analyzeHarmfulAdvice(content),
        this.analyzeInappropriateContent(content),
        this.analyzePrivacyLeak(content, userProfile),
        this.analyzeProfessionalBoundaries(content)
      ]);

      const safetyFlags: SafetyFlags = {
        selfHarm: harmfulAdviceResult.detected,
        suicidalLanguage: false, // AI shouldn't generate suicidal content
        toxicity: inappropriateContentResult.detected,
        confidenceScore: this.calculateOverallConfidence([
          harmfulAdviceResult.confidence,
          inappropriateContentResult.confidence,
          privacyLeakResult.confidence,
          professionalBoundariesResult.confidence
        ]),
        requiresEscalation: this.shouldEscalate([
          harmfulAdviceResult,
          inappropriateContentResult,
          privacyLeakResult,
          professionalBoundariesResult
        ]),
        interventionRequired: false // AI output shouldn't trigger emergency interventions
      };

      const processingTime = Date.now() - startTime;
      
      // Log output safety analysis
      this.logSafetyAnalysis('output', content, safetyFlags, processingTime);
      
      // Handle unsafe AI outputs
      if (safetyFlags.requiresEscalation || safetyFlags.confidenceScore > 0.7) {
        await this.handleUnsafeOutput(userProfile.id, content, safetyFlags);
      }

      return safetyFlags;

    } catch (error) {
      console.error('❌ Output safety analysis failed:', error);
      
      // Return conservative flags - block potentially unsafe output
      return {
        selfHarm: false,
        suicidalLanguage: false,
        toxicity: true, // Block output on analysis failure
        confidenceScore: 1.0,
        requiresEscalation: true,
        interventionRequired: false
      };
    }
  }

  /**
   * General safety analysis for any content
   */
  async analyzeSafety(content: string, userProfile: UserProfile): Promise<SafetyFlags> {
    return await this.analyzeInput(content, userProfile);
  }

  /**
   * Detect crisis situations requiring immediate intervention
   */
  async detectCrisis(
    content: string, 
    userProfile: UserProfile, 
    conversationHistory?: string[]
  ): Promise<CrisisDetection> {
    try {
      // Multi-factor crisis detection
      const [
        keywordAnalysis,
        sentimentAnalysis,
        contextualAnalysis,
        behavioralAnalysis
      ] = await Promise.all([
        this.analyzeCrisisKeywords(content),
        this.analyzeCrisisSentiment(content),
        this.analyzeConversationContext(conversationHistory || []),
        this.analyzeBehavioralIndicators(userProfile)
      ]);

      // Determine crisis level
      const crisisScore = this.calculateCrisisScore([
        keywordAnalysis,
        sentimentAnalysis,
        contextualAnalysis,
        behavioralAnalysis
      ]);

      let level: CrisisDetection['level'] = 'none';
      let recommendedAction: CrisisDetection['recommendedAction'] = 'continue';

      if (crisisScore >= 0.9) {
        level = 'emergency';
        recommendedAction = 'immediate_intervention';
      } else if (crisisScore >= 0.7) {
        level = 'intervention';
        recommendedAction = 'escalate';
      } else if (crisisScore >= 0.4) {
        level = 'watch';
        recommendedAction = 'continue';
      }

      const crisisDetection: CrisisDetection = {
        level,
        indicators: [
          ...keywordAnalysis.indicators,
          ...sentimentAnalysis.indicators,
          ...contextualAnalysis.indicators,
          ...behavioralAnalysis.indicators
        ],
        confidence: crisisScore,
        recommendedAction,
        resources: await this.getCrisisResources(userProfile.id)
      };

      // Log crisis detection
      this.logCrisisDetection(userProfile.id, crisisDetection);
      
      // Trigger appropriate response
      if (level === 'emergency') {
        await this.triggerEmergencyResponse(userProfile.id, content, crisisDetection);
      } else if (level === 'intervention') {
        await this.triggerInterventionProtocol(userProfile.id, content, crisisDetection);
      }

      return crisisDetection;

    } catch (error) {
      console.error('❌ Crisis detection failed:', error);
      
      // Return safe default - assume potential crisis for safety
      return {
        level: 'intervention',
        indicators: ['crisis_detection_failure'],
        confidence: 0.5,
        recommendedAction: 'escalate',
        resources: await this.getCrisisResources(userProfile.id)
      };
    }
  }

  /**
   * Add content to human review queue
   */
  async queueForHumanReview(
    userId: string,
    content: string,
    reason: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    metadata?: Record<string, any>
  ): Promise<string> {
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const reviewItem: ReviewQueueItem = {
      id: reviewId,
      userId,
      content,
      reason,
      priority,
      metadata: metadata || {},
      status: 'pending',
      createdAt: new Date(),
      assignedTo: null,
      reviewedAt: null,
      decision: null,
      notes: null
    };

    this.humanReviewQueue.set(reviewId, reviewItem);
    
    // Emit review queue event
    this.eventBus.emit('safety.review_queued', {
      reviewId,
      userId,
      priority,
      reason,
      timestamp: new Date()
    });

    console.log(`👥 Content queued for human review: ${reviewId} (${priority} priority)`);
    
    // Alert reviewers for high-priority items
    if (priority === 'urgent' || priority === 'high') {
      await this.alertHumanReviewers(reviewItem);
    }

    return reviewId;
  }

  /**
   * Get human review queue for moderators
   */
  getReviewQueue(filters?: {
    priority?: string;
    status?: string;
    assignedTo?: string;
  }): ReviewQueueItem[] {
    let items = Array.from(this.humanReviewQueue.values());
    
    if (filters) {
      if (filters.priority) {
        items = items.filter(item => item.priority === filters.priority);
      }
      if (filters.status) {
        items = items.filter(item => item.status === filters.status);
      }
      if (filters.assignedTo) {
        items = items.filter(item => item.assignedTo === filters.assignedTo);
      }
    }
    
    // Sort by priority and creation time
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    
    return items.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * Process human review decision
   */
  async processReviewDecision(
    reviewId: string,
    reviewerId: string,
    decision: 'approved' | 'rejected' | 'escalated',
    notes?: string
  ): Promise<void> {
    const reviewItem = this.humanReviewQueue.get(reviewId);
    if (!reviewItem) {
      throw new Error(`Review item ${reviewId} not found`);
    }

    // Update review item
    reviewItem.status = decision === 'escalated' ? 'escalated' : 'completed';
    reviewItem.assignedTo = reviewerId;
    reviewItem.reviewedAt = new Date();
    reviewItem.decision = decision;
    reviewItem.notes = notes || null;

    // Emit review completion event
    this.eventBus.emit('safety.review_completed', {
      reviewId,
      userId: reviewItem.userId,
      reviewerId,
      decision,
      timestamp: new Date()
    });

    console.log(`✅ Review completed: ${reviewId} -> ${decision}`);
    
    // Handle escalations
    if (decision === 'escalated') {
      await this.escalateReview(reviewItem, reviewerId);
    }
  }

  // Private safety analysis methods
  private async analyzeToxicity(content: string): Promise<SafetyResult> {
    const toxicKeywords = [
      'hate', 'stupid', 'idiot', 'moron', 'loser', 'worthless',
      'kill yourself', 'go die', 'pathetic', 'disgusting'
    ];
    
    const lowerContent = content.toLowerCase();
    let toxicityScore = 0;
    const detectedKeywords: string[] = [];
    
    toxicKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        toxicityScore += 0.3;
        detectedKeywords.push(keyword);
      }
    });
    
    // Check for excessive profanity
    const profanityCount = (content.match(/\b(damn|hell|shit|fuck|bitch|asshole)\b/gi) || []).length;
    if (profanityCount > 3) {
      toxicityScore += 0.2;
    }

    return {
      detected: toxicityScore > 0.5,
      confidence: Math.min(toxicityScore, 1.0),
      indicators: detectedKeywords,
      details: { detectedKeywords, profanityCount }
    };
  }

  private async analyzeSelfHarm(content: string, userProfile: UserProfile): Promise<SafetyResult> {
    const selfHarmKeywords = [
      'cut myself', 'cutting', 'self harm', 'hurt myself', 'harm myself',
      'razor', 'blade', 'burn myself', 'hit myself', 'punish myself'
    ];
    
    const lowerContent = content.toLowerCase();
    let harmScore = 0;
    const detectedKeywords: string[] = [];
    
    selfHarmKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        harmScore += 0.4;
        detectedKeywords.push(keyword);
      }
    });
    
    // Consider user's mental health history
    if (userProfile.mentalHealthFlags?.riskLevel === 'high' || userProfile.mentalHealthFlags?.riskLevel === 'critical') {
      harmScore *= 1.5; // Amplify for high-risk users
    }

    return {
      detected: harmScore > 0.4,
      confidence: Math.min(harmScore, 1.0),
      indicators: detectedKeywords,
      details: { userRiskLevel: userProfile.mentalHealthFlags?.riskLevel || 'unknown' }
    };
  }

  private async analyzeSuicidalLanguage(content: string, userProfile: UserProfile): Promise<SafetyResult> {
    const suicidalKeywords = [
      'kill myself', 'suicide', 'end my life', 'take my life', 'don\'t want to live',
      'better off dead', 'end it all', 'no reason to live', 'want to die',
      'jump off', 'overdose', 'hang myself', 'shoot myself'
    ];
    
    const lowerContent = content.toLowerCase();
    let suicidalScore = 0;
    const detectedKeywords: string[] = [];
    
    suicidalKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        suicidalScore += 0.5; // High weight for suicidal language
        detectedKeywords.push(keyword);
      }
    });
    
    // Look for phrases indicating hopelessness
    const hopelessPhrases = ['no hope', 'hopeless', 'no point', 'no way out', 'can\'t go on'];
    hopelessPhrases.forEach(phrase => {
      if (lowerContent.includes(phrase)) {
        suicidalScore += 0.2;
        detectedKeywords.push(phrase);
      }
    });
    
    // Amplify for high-risk users
    if (userProfile.mentalHealthFlags?.riskLevel === 'critical') {
      suicidalScore *= 2.0;
    }

    return {
      detected: suicidalScore > 0.3,
      confidence: Math.min(suicidalScore, 1.0),
      indicators: detectedKeywords,
      details: { 
        userRiskLevel: userProfile.mentalHealthFlags?.riskLevel || 'unknown',
        hopelessnessIndicators: hopelessPhrases.filter(p => lowerContent.includes(p))
      }
    };
  }

  private async analyzeContextualRisk(content: string, userProfile: UserProfile): Promise<SafetyResult> {
    let riskScore = 0;
    const indicators: string[] = [];
    
    // Time-based risk factors
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      riskScore += 0.1;
      indicators.push('late_night_activity');
    }
    
    // User behavior patterns
    if (userProfile.stressScore && userProfile.stressScore > 0.7) {
      riskScore += 0.2;
      indicators.push('high_stress_level');
    }
    
    // Frequency of mental health discussions
    const mentalHealthTerms = ['depressed', 'anxious', 'overwhelmed', 'panic', 'therapy', 'medication'];
    const mentionCount = mentalHealthTerms.filter(term => content.toLowerCase().includes(term)).length;
    if (mentionCount >= 3) {
      riskScore += 0.2;
      indicators.push('frequent_mental_health_mentions');
    }

    return {
      detected: riskScore > 0.3,
      confidence: riskScore,
      indicators,
      details: { hour, stressScore: userProfile.stressScore, mentalHealthTerms: mentionCount }
    };
  }

  private async analyzeHarmfulAdvice(content: string): Promise<SafetyResult> {
    const harmfulAdvicePatterns = [
      'you should hurt', 'try cutting', 'nobody cares about you',
      'give up', 'it\'s hopeless', 'you\'re worthless',
      'just end it', 'people would be better without you'
    ];
    
    const lowerContent = content.toLowerCase();
    let harmfulScore = 0;
    const detectedPatterns: string[] = [];
    
    harmfulAdvicePatterns.forEach(pattern => {
      if (lowerContent.includes(pattern)) {
        harmfulScore += 0.6; // High weight for harmful advice
        detectedPatterns.push(pattern);
      }
    });

    return {
      detected: harmfulScore > 0.3,
      confidence: Math.min(harmfulScore, 1.0),
      indicators: detectedPatterns,
      details: { detectedPatterns }
    };
  }

  private async analyzeInappropriateContent(content: string): Promise<SafetyResult> {
    // Check for inappropriate content in AI responses
    const inappropriatePatterns = [
      'personal information', 'medical diagnosis', 'legal advice',
      'financial advice', 'relationship counseling', 'professional therapy'
    ];
    
    const lowerContent = content.toLowerCase();
    let inappropriateScore = 0;
    const detectedPatterns: string[] = [];
    
    // AI shouldn't provide professional services
    if (lowerContent.includes('i diagnose') || lowerContent.includes('you have ')) {
      inappropriateScore += 0.5;
      detectedPatterns.push('inappropriate_diagnosis');
    }
    
    // Check for overstepping boundaries
    inappropriatePatterns.forEach(pattern => {
      if (lowerContent.includes(pattern)) {
        inappropriateScore += 0.2;
        detectedPatterns.push(pattern);
      }
    });

    return {
      detected: inappropriateScore > 0.3,
      confidence: inappropriateScore,
      indicators: detectedPatterns,
      details: { detectedPatterns }
    };
  }

  private async analyzePrivacyLeak(content: string, userProfile: UserProfile): Promise<SafetyResult> {
    const privacyPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}-?\d{3}-?\d{4}\b/, // Phone
      /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Credit card
      /\b\d{3}-\d{2}-\d{4}\b/ // SSN
    ];
    
    let privacyScore = 0;
    const leakTypes: string[] = [];
    
    privacyPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        privacyScore += 0.8; // High weight for PII leaks
        leakTypes.push(['email', 'phone', 'credit_card', 'ssn'][index]);
      }
    });

    return {
      detected: privacyScore > 0.3,
      confidence: Math.min(privacyScore, 1.0),
      indicators: leakTypes,
      details: { leakTypes }
    };
  }

  private async analyzeProfessionalBoundaries(content: string): Promise<SafetyResult> {
    const boundaryViolations = [
      'i am a doctor', 'i am a therapist', 'i can treat you',
      'take this medication', 'stop your medication', 'medical diagnosis'
    ];
    
    const lowerContent = content.toLowerCase();
    let boundaryScore = 0;
    const violations: string[] = [];
    
    boundaryViolations.forEach(violation => {
      if (lowerContent.includes(violation)) {
        boundaryScore += 0.5;
        violations.push(violation);
      }
    });

    return {
      detected: boundaryScore > 0.3,
      confidence: boundaryScore,
      indicators: violations,
      details: { violations }
    };
  }

  // Crisis analysis methods
  private async analyzeCrisisKeywords(content: string): Promise<CrisisAnalysisResult> {
    const emergencyKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die',
      'no reason to live', 'better off dead', 'can\'t go on'
    ];
    
    const warningKeywords = [
      'hopeless', 'trapped', 'burden', 'pain', 'suffering',
      'desperate', 'exhausted', 'overwhelmed'
    ];
    
    const lowerContent = content.toLowerCase();
    let crisisScore = 0;
    const indicators: string[] = [];
    
    emergencyKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        crisisScore += 0.4;
        indicators.push(keyword);
      }
    });
    
    warningKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        crisisScore += 0.2;
        indicators.push(keyword);
      }
    });

    return { score: Math.min(crisisScore, 1.0), indicators };
  }

  private async analyzeCrisisSentiment(content: string): Promise<CrisisAnalysisResult> {
    // Mock sentiment analysis for crisis detection
    const negativeWords = ['sad', 'depressed', 'hopeless', 'angry', 'frustrated', 'alone'];
    const positiveWords = ['happy', 'good', 'better', 'hopeful', 'grateful'];
    
    const words = content.toLowerCase().split(/\s+/);
    let sentimentScore = 0;
    const indicators: string[] = [];
    
    negativeWords.forEach(word => {
      if (words.includes(word)) {
        sentimentScore += 0.1;
        indicators.push(word);
      }
    });
    
    positiveWords.forEach(word => {
      if (words.includes(word)) {
        sentimentScore -= 0.1;
      }
    });

    return { 
      score: Math.max(0, sentimentScore), 
      indicators: indicators.slice(0, 3) // Limit indicators
    };
  }

  private async analyzeConversationContext(conversationHistory: string[]): Promise<CrisisAnalysisResult> {
    if (conversationHistory.length === 0) {
      return { score: 0, indicators: [] };
    }
    
    const recentMessages = conversationHistory.slice(-5);
    const combinedContent = recentMessages.join(' ').toLowerCase();
    
    // Look for escalating distress patterns
    let contextScore = 0;
    const indicators: string[] = [];
    
    if (combinedContent.includes('getting worse')) {
      contextScore += 0.2;
      indicators.push('escalating_distress');
    }
    
    if (combinedContent.includes('tried everything')) {
      contextScore += 0.2;
      indicators.push('exhausted_options');
    }

    return { score: contextScore, indicators };
  }

  private async analyzeBehavioralIndicators(userProfile: UserProfile): Promise<CrisisAnalysisResult> {
    let behaviorScore = 0;
    const indicators: string[] = [];
    
    // Check user's risk level
    switch (userProfile.mentalHealthFlags?.riskLevel) {
      case 'critical':
        behaviorScore += 0.5;
        indicators.push('critical_risk_profile');
        break;
      case 'high':
        behaviorScore += 0.3;
        indicators.push('high_risk_profile');
        break;
      case 'medium':
        behaviorScore += 0.1;
        indicators.push('medium_risk_profile');
        break;
    }
    
    // Check stress levels
    if (userProfile.stressScore && userProfile.stressScore > 0.8) {
      behaviorScore += 0.2;
      indicators.push('extreme_stress');
    }

    return { score: behaviorScore, indicators };
  }

  // Helper methods
  private calculateOverallConfidence(confidences: number[]): number {
    if (confidences.length === 0) return 0;
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  private shouldEscalate(results: SafetyResult[]): boolean {
    return results.some(result => 
      result.detected && result.confidence > 0.6
    );
  }

  private requiresImmediateIntervention(results: SafetyResult[]): boolean {
    return results.some(result => 
      result.detected && result.confidence > 0.8
    );
  }

  private calculateCrisisScore(analyses: CrisisAnalysisResult[]): number {
    const totalScore = analyses.reduce((sum, analysis) => sum + analysis.score, 0);
    return Math.min(totalScore, 1.0);
  }

  private async initializeSafetyModels(): Promise<void> {
    // Initialize different safety models
    this.safetyModels.set('toxicity', new ToxicityModel());
    this.safetyModels.set('self_harm', new SelfHarmModel());
    this.safetyModels.set('crisis', new CrisisModel());
    
    console.log('🤖 Safety models initialized');
  }

  private async loadModerationRules(): Promise<void> {
    // Load moderation rules from configuration
    this.moderationRules = [
      {
        id: 'emergency_keywords',
        type: 'keyword',
        patterns: ['suicide', 'kill myself', 'end my life'],
        action: 'immediate_escalation',
        priority: 'urgent'
      },
      {
        id: 'self_harm_indicators',
        type: 'keyword',
        patterns: ['cut myself', 'hurt myself', 'self harm'],
        action: 'human_review',
        priority: 'high'
      },
      {
        id: 'toxicity_filter',
        type: 'ml_classifier',
        threshold: 0.7,
        action: 'content_filter',
        priority: 'medium'
      }
    ];
    
    console.log('📋 Moderation rules loaded');
  }

  private async setupEmergencyContacts(): Promise<void> {
    this.emergencyContacts = [
      {
        id: 'nspl_us',
        name: 'National Suicide Prevention Lifeline (US)',
        number: '988',
        country: 'US',
        available24h: true,
        type: 'crisis_hotline'
      },
      {
        id: 'crisis_text_line',
        name: 'Crisis Text Line',
        number: '741741',
        country: 'US',
        available24h: true,
        type: 'text_support',
        instructions: 'Text HOME to 741741'
      },
      {
        id: 'doh_ph',
        name: 'DOH Crisis Hotline (Philippines)',
        number: '1553',
        country: 'PH',
        available24h: true,
        type: 'crisis_hotline'
      },
      {
        id: 'hopeline_ph',
        name: 'Hopeline Philippines',
        number: '0917-558-4673',
        country: 'PH',
        available24h: true,
        type: 'crisis_hotline'
      }
    ];
    
    console.log('☎️  Emergency contacts configured');
  }

  private startReviewMonitoring(): void {
    // Monitor human review queue
    setInterval(() => {
      this.processReviewQueue();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    console.log('👥 Human review monitoring started');
  }

  private async processReviewQueue(): Promise<void> {
    const urgentItems = Array.from(this.humanReviewQueue.values())
      .filter(item => item.priority === 'urgent' && item.status === 'pending');
    
    if (urgentItems.length > 0) {
      console.log(`⚠️  ${urgentItems.length} urgent items in review queue`);
      
      // Alert reviewers
      this.eventBus.emit('safety.urgent_review_needed', {
        count: urgentItems.length,
        oldestItem: urgentItems.reduce((oldest, item) => 
          item.createdAt < oldest.createdAt ? item : oldest
        ),
        timestamp: new Date()
      });
    }
  }

  private async getCrisisResources(userId: string): Promise<CrisisDetection['resources']> {
    // Get localized crisis resources based on user location
    // For now, return default resources
    return {
      hotlines: this.emergencyContacts
        .filter(contact => contact.type === 'crisis_hotline')
        .map(contact => ({
          name: contact.name,
          number: contact.number,
          country: contact.country,
          available24h: contact.available24h
        })),
      localServices: [
        'University Counseling Center',
        'Community Mental Health Center',
        'Employee Assistance Program'
      ],
      emergencyContacts: ['911', 'Local Emergency Services']
    };
  }

  // Event handling methods
  private logSafetyAnalysis(
    type: 'input' | 'output',
    content: string,
    flags: SafetyFlags,
    processingTime: number
  ): void {
    this.eventBus.emit('safety.analysis_completed', {
      type,
      flags,
      processingTime,
      hasViolations: flags.selfHarm || flags.suicidalLanguage || flags.toxicity,
      timestamp: new Date()
    });
  }

  private logCrisisDetection(userId: string, detection: CrisisDetection): void {
    this.eventBus.emit('safety.crisis_detected', {
      userId,
      level: detection.level,
      confidence: detection.confidence,
      indicators: detection.indicators,
      timestamp: new Date()
    });
  }

  private async triggerEmergencyIntervention(
    userId: string,
    content: string,
    flags: SafetyFlags
  ): Promise<void> {
    console.log(`🚨 EMERGENCY INTERVENTION: User ${userId}`);
    
    this.eventBus.emit('safety.emergency_intervention', {
      userId,
      flags,
      timestamp: new Date(),
      requiresImmediate: true
    });
    
    // Queue for immediate human review
    await this.queueForHumanReview(
      userId,
      content,
      'Emergency intervention triggered',
      'urgent',
      { flags, triggerType: 'emergency_intervention' }
    );
  }

  private async escalateToHumanReview(
    userId: string,
    content: string,
    flags: SafetyFlags,
    context: string
  ): Promise<void> {
    console.log(`⬆️  Escalating to human review: User ${userId}`);
    
    await this.queueForHumanReview(
      userId,
      content,
      `Safety escalation: ${context}`,
      flags.interventionRequired ? 'urgent' : 'high',
      { flags, context }
    );
  }

  private async handleUnsafeOutput(
    userId: string,
    content: string,
    flags: SafetyFlags
  ): Promise<void> {
    console.log(`🚫 Unsafe AI output blocked for user ${userId}`);
    
    this.eventBus.emit('safety.unsafe_output_blocked', {
      userId,
      flags,
      timestamp: new Date()
    });
    
    // Queue for review to improve safety models
    await this.queueForHumanReview(
      userId,
      content,
      'Unsafe AI output detected',
      'medium',
      { flags, type: 'output_safety_violation' }
    );
  }

  private async triggerEmergencyResponse(
    userId: string,
    content: string,
    detection: CrisisDetection
  ): Promise<void> {
    console.log(`🆘 EMERGENCY CRISIS RESPONSE: User ${userId}`);
    
    this.eventBus.emit('crisis.emergency_response', {
      userId,
      detection,
      timestamp: new Date(),
      responsesTriggered: ['human_alert', 'resource_provision', 'follow_up_scheduled']
    });
  }

  private async triggerInterventionProtocol(
    userId: string,
    content: string,
    detection: CrisisDetection
  ): Promise<void> {
    console.log(`🔔 Crisis intervention protocol: User ${userId}`);
    
    this.eventBus.emit('crisis.intervention_triggered', {
      userId,
      detection,
      timestamp: new Date()
    });
  }

  private async alertHumanReviewers(item: ReviewQueueItem): Promise<void> {
    console.log(`📢 Alerting human reviewers for ${item.priority} priority review: ${item.id}`);
    
    this.eventBus.emit('safety.reviewer_alert', {
      reviewId: item.id,
      priority: item.priority,
      reason: item.reason,
      timestamp: new Date()
    });
  }

  private async escalateReview(item: ReviewQueueItem, reviewerId: string): Promise<void> {
    console.log(`⬆️  Escalating review ${item.id} by ${reviewerId}`);
    
    // In production, would escalate to senior reviewers or specialized teams
    this.eventBus.emit('safety.review_escalated', {
      reviewId: item.id,
      reviewerId,
      originalReason: item.reason,
      timestamp: new Date()
    });
  }
}

// Supporting classes and interfaces
abstract class SafetyModel {
  abstract analyze(content: string, context?: any): Promise<SafetyResult>;
}

class ToxicityModel extends SafetyModel {
  async analyze(content: string): Promise<SafetyResult> {
    // Mock toxicity detection
    const toxicScore = Math.random() * 0.3; // Low random toxicity for demo
    return {
      detected: toxicScore > 0.2,
      confidence: toxicScore,
      indicators: [],
      details: {}
    };
  }
}

class SelfHarmModel extends SafetyModel {
  async analyze(content: string, userProfile?: UserProfile): Promise<SafetyResult> {
    // Mock self-harm detection
    const harmScore = content.toLowerCase().includes('hurt') ? 0.6 : Math.random() * 0.2;
    return {
      detected: harmScore > 0.4,
      confidence: harmScore,
      indicators: [],
      details: {}
    };
  }
}

class CrisisModel extends SafetyModel {
  async analyze(content: string, context?: any): Promise<SafetyResult> {
    // Mock crisis detection
    const crisisKeywords = ['suicide', 'kill myself', 'end my life'];
    const hasKeyword = crisisKeywords.some(keyword => content.toLowerCase().includes(keyword));
    
    return {
      detected: hasKeyword,
      confidence: hasKeyword ? 0.9 : 0.1,
      indicators: hasKeyword ? ['crisis_keyword_detected'] : [],
      details: {}
    };
  }
}

// Supporting interfaces
interface SafetyResult {
  detected: boolean;
  confidence: number;
  indicators: string[];
  details: Record<string, any>;
}

interface CrisisAnalysisResult {
  score: number;
  indicators: string[];
}

interface ReviewQueueItem {
  id: string;
  userId: string;
  content: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata: Record<string, any>;
  status: 'pending' | 'in_review' | 'completed' | 'escalated';
  createdAt: Date;
  assignedTo: string | null;
  reviewedAt: Date | null;
  decision: 'approved' | 'rejected' | 'escalated' | null;
  notes: string | null;
}

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  country: string;
  available24h: boolean;
  type: 'crisis_hotline' | 'text_support' | 'emergency_services';
  instructions?: string;
}

interface ModerationRule {
  id: string;
  type: 'keyword' | 'regex' | 'ml_classifier';
  patterns?: string[];
  threshold?: number;
  action: 'content_filter' | 'human_review' | 'immediate_escalation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}