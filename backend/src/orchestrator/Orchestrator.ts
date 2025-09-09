import {
  QueryContext,
  RoutingDecision,
  ModelMetadata,
  SafetyFlags,
  CrisisDetection,
  FeatureVector,
  RoutingEvent
} from './types';
import { SafetyProcessor } from '../safety/SafetyProcessor';
import { FeatureStore } from '../features/FeatureStore';
import { ModelRegistry } from '../models/ModelRegistry';
import { EventBus } from '../events/EventBus';
import { VectorDatabase } from '../vector/VectorDatabase';

/**
 * Core Orchestrator - The brain of the AI system that routes queries,
 * learns from user behavior, and ensures safety for mental health applications.
 */
export class Orchestrator {
  private safetyProcessor: SafetyProcessor;
  private featureStore: FeatureStore;
  private modelRegistry: ModelRegistry;
  private eventBus: EventBus;
  private vectorDb: VectorDatabase;
  private metaModel: any; // Small routing model
  private isInitialized = false;

  constructor(
    safetyProcessor: SafetyProcessor,
    featureStore: FeatureStore,
    modelRegistry: ModelRegistry,
    eventBus: EventBus,
    vectorDb: VectorDatabase
  ) {
    this.safetyProcessor = safetyProcessor;
    this.featureStore = featureStore;
    this.modelRegistry = modelRegistry;
    this.eventBus = eventBus;
    this.vectorDb = vectorDb;
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing AI Orchestrator...');
    
    try {
      // Initialize all components
      await this.safetyProcessor.initialize();
      await this.featureStore.initialize();
      await this.modelRegistry.initialize();
      await this.vectorDb.initialize();
      
      // Load the meta-model for routing decisions
      await this.loadMetaModel();
      
      this.isInitialized = true;
      console.log('✅ AI Orchestrator initialized successfully');
      
      // Emit initialization event
      this.eventBus.emit('orchestrator.initialized', {
        timestamp: new Date(),
        status: 'ready'
      });
    } catch (error) {
      console.error('❌ Failed to initialize Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Main orchestration method - processes queries and returns intelligent responses
   */
  async processQuery(context: QueryContext): Promise<{
    response: string;
    routingDecision: RoutingDecision;
    safetyFlags: SafetyFlags;
    eventId: string;
  }> {
    if (!this.isInitialized) {
      throw new Error('Orchestrator not initialized');
    }

    const startTime = Date.now();
    const eventId = this.generateEventId();

    try {
      console.log(`🧠 Processing query for user ${context.userId}: "${context.query.substring(0, 50)}..."`);

      // Step 1: Safety pre-screening
      const safetyFlags = await this.safetyProcessor.analyzeInput(context.query, context.userProfile);
      
      // Step 2: Crisis detection for mental health
      const crisisDetection = await this.detectCrisisSignals(context, safetyFlags);
      
      // Step 3: Handle crisis situations immediately
      if (crisisDetection.level === 'emergency' || crisisDetection.level === 'intervention') {
        return await this.handleCrisisResponse(context, crisisDetection, eventId);
      }

      // Step 4: Extract features for routing decision
      const features = await this.extractFeatures(context);

      // Step 5: Route to appropriate model/pipeline
      const routingDecision = await this.makeRoutingDecision(context, features, safetyFlags);

      // Step 6: Execute the chosen pipeline
      const response = await this.executePipeline(context, routingDecision, features);

      // Step 7: Post-process and safety check the response
      const finalResponse = await this.postProcessResponse(response, context, safetyFlags);

      // Step 8: Log the interaction for learning
      await this.logInteraction(context, routingDecision, features, safetyFlags, finalResponse, eventId);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Query processed in ${processingTime}ms (model: ${routingDecision.modelId})`);

      return {
        response: finalResponse,
        routingDecision,
        safetyFlags,
        eventId
      };

    } catch (error) {
      console.error('❌ Error processing query:', error);
      
      // Log the error event
      await this.logError(context, error, eventId);
      
      // Return safe fallback response
      return this.getFallbackResponse(context, eventId);
    }
  }

  /**
   * Load and initialize the meta-model for routing decisions
   */
  private async loadMetaModel(): Promise<void> {
    try {
      // In production, this would load a small quantized model (7B or smaller)
      // For now, we'll implement rule-based routing with ML-inspired scoring
      this.metaModel = {
        version: '1.0',
        type: 'rule_based_with_scoring',
        initialized: true
      };
      
      console.log('📊 Meta-model loaded for routing decisions');
    } catch (error) {
      console.error('❌ Failed to load meta-model:', error);
      throw error;
    }
  }

  /**
   * Detect crisis signals that require immediate intervention
   */
  private async detectCrisisSignals(context: QueryContext, safetyFlags: SafetyFlags): Promise<CrisisDetection> {
    // High-priority mental health keywords
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living',
      'want to die', 'hurt myself', 'self harm', 'cutting',
      'overdose', 'jump off', 'hopeless', 'no way out'
    ];

    const watchKeywords = [
      'depressed', 'anxious', 'panic', 'overwhelmed',
      'can\'t cope', 'breaking down', 'mental health',
      'therapy', 'counseling', 'medication'
    ];

    const query = context.query.toLowerCase();
    
    // Check for emergency indicators
    const emergencyMatches = crisisKeywords.filter(keyword => query.includes(keyword));
    const watchMatches = watchKeywords.filter(keyword => query.includes(keyword));

    let level: CrisisDetection['level'] = 'none';
    let confidence = 0;

    if (emergencyMatches.length > 0 || safetyFlags.suicidalLanguage || safetyFlags.selfHarm) {
      level = 'emergency';
      confidence = 0.9;
    } else if (watchMatches.length >= 2 || safetyFlags.requiresEscalation) {
      level = 'intervention';
      confidence = 0.7;
    } else if (watchMatches.length > 0) {
      level = 'watch';
      confidence = 0.5;
    }

    return {
      level,
      indicators: [...emergencyMatches, ...watchMatches],
      confidence,
      recommendedAction: level === 'emergency' ? 'immediate_intervention' : 
                       level === 'intervention' ? 'escalate' : 'continue',
      resources: {
        hotlines: [
          { name: 'National Suicide Prevention Lifeline', number: '988', country: 'US', available24h: true },
          { name: 'Crisis Helpline Philippines', number: '0917-899-8727', country: 'PH', available24h: true },
          { name: 'DOH Crisis Hotline', number: '1553', country: 'PH', available24h: true }
        ],
        localServices: ['Community Mental Health Centers', 'University Counseling Services'],
        emergencyContacts: ['911', 'Local Emergency Services']
      }
    };
  }

  /**
   * Handle crisis situations with immediate safe responses
   */
  private async handleCrisisResponse(
    context: QueryContext, 
    crisisDetection: CrisisDetection, 
    eventId: string
  ): Promise<any> {
    const safeResponse = `I'm concerned about what you've shared. Your safety and well-being are important. Please reach out to a mental health professional or crisis helpline right away:

🆘 **Immediate Help:**
- National Crisis Helpline: 988 (US) or 1553 (Philippines)
- Text "HELLO" to 741741 for Crisis Text Line
- Go to your nearest emergency room if in immediate danger

🏥 **Local Resources:**
- University counseling services
- Community mental health centers
- Your healthcare provider

Remember: You are not alone, and there are people who want to help. These feelings can change, and professional support can make a real difference.

Would you like me to help you find specific local mental health resources?`;

    // Log crisis event for human review
    await this.eventBus.emit('crisis.detected', {
      eventId,
      userId: context.userId,
      level: crisisDetection.level,
      indicators: crisisDetection.indicators,
      query: context.query,
      timestamp: new Date(),
      requiresImmediateReview: true
    });

    // Alert human moderators immediately
    await this.eventBus.emit('alert.human_review_required', {
      eventId,
      priority: 'emergency',
      userId: context.userId,
      reason: 'Crisis detection triggered',
      context: context.query
    });

    return {
      response: safeResponse,
      routingDecision: {
        modelId: 'crisis_intervention',
        version: '1.0',
        pipeline: [{ type: 'safety', processor: 'crisis_handler', parameters: {}, timeout: 1000 }],
        expectedLatencyMs: 500,
        confidence: 1.0,
        reasoningTrace: ['Crisis detected', 'Safe response provided', 'Human review triggered']
      },
      safetyFlags: {
        ...crisisDetection,
        requiresEscalation: true,
        interventionRequired: true
      } as any,
      eventId
    };
  }

  /**
   * Extract features from the query context for routing decisions
   */
  private async extractFeatures(context: QueryContext): Promise<FeatureVector> {
    const features: FeatureVector = {
      userId: context.userId,
      timestamp: new Date(),
      features: {}
    };

    // Extract text embeddings (in production, use actual embedding model)
    features.features.textEmbedding = await this.getTextEmbedding(context.query);

    // Extract conversational context
    features.features.conversationalContext = this.extractConversationalFeatures(context.conversationHistory);

    // Get user behavior features from feature store
    const behaviorFeatures = await this.featureStore.getUserFeatures(context.userId);
    features.features.userBehavior = behaviorFeatures;

    // Extract mental health indicators
    features.features.mentalHealthIndicators = await this.extractMentalHealthFeatures(context);

    return features;
  }

  /**
   * Make intelligent routing decision based on context and features
   */
  private async makeRoutingDecision(
    context: QueryContext,
    features: FeatureVector,
    safetyFlags: SafetyFlags
  ): Promise<RoutingDecision> {
    // Get available models
    const availableModels = await this.modelRegistry.getAvailableModels();
    
    // Rule-based routing with scoring (in production, use actual ML model)
    const scores = this.scoreModels(context, features, availableModels);
    
    // Select best model
    const bestModel = this.selectBestModel(scores, safetyFlags);
    
    // Construct pipeline
    const pipeline = this.buildPipeline(context, bestModel, safetyFlags);

    return {
      modelId: bestModel.id,
      version: bestModel.version,
      pipeline,
      fallbackModel: this.getFallbackModelId(availableModels),
      expectedLatencyMs: bestModel.avgLatencyMs,
      confidence: scores[bestModel.id],
      reasoningTrace: [
        `Selected ${bestModel.id} based on query type and user context`,
        `Safety level: ${safetyFlags.selfHarm ? 'high' : 'normal'}`,
        `Pipeline steps: ${pipeline.length}`
      ]
    };
  }

  /**
   * Execute the chosen pipeline
   */
  private async executePipeline(
    context: QueryContext,
    routing: RoutingDecision,
    features: FeatureVector
  ): Promise<string> {
    let currentData = context.query;

    for (const step of routing.pipeline) {
      switch (step.type) {
        case 'preprocessing':
          currentData = await this.executePreprocessing(currentData, step.parameters);
          break;
        case 'model_call':
          currentData = await this.executeModelCall(currentData, routing.modelId, context, features);
          break;
        case 'postprocessing':
          currentData = await this.executePostprocessing(currentData, step.parameters);
          break;
        case 'safety':
          const safetyResult = await this.safetyProcessor.analyzeSafety(currentData, context.userProfile);
          if (safetyResult.requiresEscalation) {
            throw new Error('Safety violation in response');
          }
          break;
      }
    }

    return currentData;
  }

  /**
   * Helper methods for pipeline execution
   */
  private async executeModelCall(
    input: string,
    modelId: string,
    context: QueryContext,
    features: FeatureVector
  ): Promise<string> {
    // In production, this would call the actual model endpoint
    const model = await this.modelRegistry.getModel(modelId);
    
    // Mock response based on model type
    if (modelId.includes('mental_health')) {
      return this.generateMentalHealthResponse(input, context);
    } else if (modelId.includes('educational')) {
      return this.generateEducationalResponse(input, context);
    } else {
      return this.generateGeneralResponse(input, context);
    }
  }

  private generateMentalHealthResponse(input: string, context: QueryContext): string {
    return `I understand you're going through a challenging time. It's important to remember that seeking help is a sign of strength. Based on what you've shared, here are some supportive suggestions:

1. **Immediate self-care**: Try some deep breathing exercises or a short walk if possible.

2. **Professional support**: Consider speaking with a school counselor, therapist, or trusted adult about these feelings.

3. **Community resources**: Many schools offer mental health support services that can be very helpful.

4. **Remember**: These difficult feelings are temporary, and with the right support, you can work through them.

Would you like me to help you find specific resources or coping strategies that might be helpful right now?`;
  }

  private generateEducationalResponse(input: string, context: QueryContext): string {
    return `I'd be happy to help you with your educational question! Let me provide some guidance and resources that might be useful for your learning.

Based on your question, here are some key points and suggestions for further exploration. Remember that learning is a process, and it's okay to take time to understand complex concepts.

Is there a specific aspect you'd like me to explain in more detail?`;
  }

  private generateGeneralResponse(input: string, context: QueryContext): string {
    return `Thank you for your question. I'm here to help and provide support. Let me share some thoughts and information that might be helpful.

If you're looking for additional resources or have other questions, please feel free to ask. I'm designed to be helpful, harmless, and honest in all our interactions.`;
  }

  // Additional helper methods
  private async getTextEmbedding(text: string): Promise<number[]> {
    // Mock embedding - in production use actual embedding model
    return new Array(384).fill(0).map(() => Math.random());
  }

  private extractConversationalFeatures(history: any[]): number[] {
    // Extract features from conversation history
    return new Array(256).fill(0).map(() => Math.random());
  }

  private async extractMentalHealthFeatures(context: QueryContext): Promise<any> {
    const query = context.query.toLowerCase();
    
    return {
      sentimentScore: query.includes('sad') || query.includes('depressed') ? -0.8 : 
                     query.includes('happy') || query.includes('excited') ? 0.8 : 0,
      anxietyLevel: query.includes('anxious') || query.includes('worried') ? 0.9 : 0.1,
      stressIndicators: query.match(/stress|pressure|overwhelm/g) || [],
      supportNeeded: query.includes('help') || query.includes('support')
    };
  }

  private scoreModels(context: QueryContext, features: FeatureVector, models: ModelMetadata[]): Record<string, number> {
    const scores: Record<string, number> = {};
    
    for (const model of models) {
      let score = 0.5; // Base score
      
      // Boost mental health specialized models for relevant queries
      if (context.query.toLowerCase().includes('anxious') || 
          context.query.toLowerCase().includes('stress') ||
          context.query.toLowerCase().includes('mental health')) {
        if (model.id.includes('mental_health') || model.id.includes('counseling')) {
          score += 0.3;
        }
      }
      
      // Boost educational models for learning queries
      if (context.query.toLowerCase().includes('study') ||
          context.query.toLowerCase().includes('learn') ||
          context.query.toLowerCase().includes('homework')) {
        if (model.id.includes('educational') || model.id.includes('tutor')) {
          score += 0.3;
        }
      }
      
      scores[model.id] = Math.min(score, 1.0);
    }
    
    return scores;
  }

  private selectBestModel(scores: Record<string, number>, safetyFlags: SafetyFlags): ModelMetadata {
    // Mock model selection - in production use actual model registry
    return {
      id: 'mental_health_counselor_v2',
      name: 'Mental Health Support Model',
      version: '2.1',
      type: 'chat',
      capabilities: ['mental_health', 'crisis_support', 'therapeutic'],
      targetUseCase: ['mental_health_support', 'crisis_intervention'],
      safetyRating: 0.95,
      costPerToken: 0.001,
      avgLatencyMs: 800,
      deploymentStatus: 'production'
    };
  }

  private buildPipeline(context: QueryContext, model: ModelMetadata, safetyFlags: SafetyFlags): any[] {
    const pipeline = [
      { type: 'preprocessing', processor: 'text_cleaner', parameters: {}, timeout: 100 },
      { type: 'safety', processor: 'input_filter', parameters: {}, timeout: 200 },
      { type: 'model_call', processor: model.id, parameters: { temperature: 0.3 }, timeout: 5000 },
      { type: 'safety', processor: 'output_filter', parameters: {}, timeout: 200 },
      { type: 'postprocessing', processor: 'response_formatter', parameters: {}, timeout: 100 }
    ];

    return pipeline;
  }

  private getFallbackModelId(models: ModelMetadata[]): string {
    return 'safe_fallback_v1';
  }

  private async executePreprocessing(data: string, params: any): Promise<string> {
    // Basic text preprocessing
    return data.trim().toLowerCase();
  }

  private async executePostprocessing(data: string, params: any): Promise<string> {
    // Format response appropriately
    return data.trim();
  }

  private async postProcessResponse(response: string, context: QueryContext, safetyFlags: SafetyFlags): Promise<string> {
    // Final safety check and formatting
    const finalSafetyCheck = await this.safetyProcessor.analyzeOutput(response, context.userProfile);
    
    if (finalSafetyCheck.requiresEscalation) {
      return "I want to help, but I think it would be best for you to speak with a qualified mental health professional about this. Would you like me to help you find local resources?";
    }
    
    return response;
  }

  private async logInteraction(
    context: QueryContext,
    routing: RoutingDecision,
    features: FeatureVector,
    safetyFlags: SafetyFlags,
    response: string,
    eventId: string
  ): Promise<void> {
    const event: RoutingEvent = {
      eventId,
      timestamp: new Date(),
      userId: context.userId,
      sessionId: context.sessionId,
      query: context.query,
      routingDecision: routing,
      features,
      safetyFlags,
      response,
      outcome: 'success'
    };

    await this.eventBus.emit('interaction.logged', event);
  }

  private async logError(context: QueryContext, error: any, eventId: string): Promise<void> {
    await this.eventBus.emit('error.occurred', {
      eventId,
      userId: context.userId,
      error: error.message,
      timestamp: new Date()
    });
  }

  private getFallbackResponse(context: QueryContext, eventId: string): any {
    return {
      response: "I'm sorry, but I'm having trouble processing your request right now. Please try again in a moment, or if this is urgent, please contact a trusted adult or mental health professional.",
      routingDecision: {
        modelId: 'fallback',
        version: '1.0',
        pipeline: [],
        expectedLatencyMs: 100,
        confidence: 0.1,
        reasoningTrace: ['System error', 'Fallback response activated']
      },
      safetyFlags: {
        selfHarm: false,
        suicidalLanguage: false,
        toxicity: false,
        confidenceScore: 1.0,
        requiresEscalation: false,
        interventionRequired: false
      },
      eventId
    };
  }

  private generateEventId(): string {
    return `orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}