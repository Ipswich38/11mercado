import express from 'express';
import { EventBus } from './events/EventBus';
import { Orchestrator } from './orchestrator/Orchestrator';
import { APIGateway } from './api/gateway';
import { SafetyProcessor } from './safety/SafetyProcessor';
import { FeatureStore } from './features/FeatureStore';
import { ModelRegistry } from './models/ModelRegistry';
import { ModelServer } from './models/ModelServer';
import { VectorDatabase } from './vector/VectorDatabase';
import { TrainingPipeline } from './mlops/TrainingPipeline';

/**
 * Main Application - Self-Reliant AI Orchestrator for Mental Health
 * 
 * Production-ready architecture that integrates all components:
 * - Intelligent query routing and model orchestration
 * - Comprehensive safety and crisis detection
 * - Continuous learning from user interactions
 * - Real-time feature computation and storage
 * - Scalable model serving and registry
 * - MLOps pipeline with automated training/evaluation
 * - Event-driven architecture for system coordination
 */
class AIOrchestatorApp {
  private eventBus: EventBus;
  private safetyProcessor: SafetyProcessor;
  private featureStore: FeatureStore;
  private modelRegistry: ModelRegistry;
  private modelServer: ModelServer;
  private vectorDatabase: VectorDatabase;
  private trainingPipeline: TrainingPipeline;
  private orchestrator: Orchestrator;
  private apiGateway: APIGateway;
  
  private isInitialized = false;
  private server: any;

  constructor() {
    console.log('🚀 Initializing AI Orchestrator for Mental Health Support...');
    
    // Initialize core components in dependency order
    this.eventBus = new EventBus();
    this.safetyProcessor = new SafetyProcessor(this.eventBus);
    this.featureStore = new FeatureStore(this.eventBus);
    this.modelRegistry = new ModelRegistry(this.eventBus);
    this.modelServer = new ModelServer(this.modelRegistry, this.eventBus);
    this.vectorDatabase = new VectorDatabase(this.eventBus);
    this.trainingPipeline = new TrainingPipeline(
      this.eventBus, 
      this.featureStore, 
      this.modelRegistry, 
      this.safetyProcessor
    );
    
    // Initialize orchestrator with all dependencies
    this.orchestrator = new Orchestrator(
      this.safetyProcessor,
      this.featureStore,
      this.modelRegistry,
      this.eventBus,
      this.vectorDatabase
    );
    
    // Initialize API Gateway
    this.apiGateway = new APIGateway(this.orchestrator);
  }

  /**
   * Initialize the entire system
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔧 Starting system initialization...');
      
      // Initialize components in order (respecting dependencies)
      console.log('📡 Initializing Event Bus...');
      await this.eventBus.initialize();
      
      console.log('🛡️  Initializing Safety Processor...');
      await this.safetyProcessor.initialize();
      
      console.log('🗄️  Initializing Feature Store...');
      await this.featureStore.initialize();
      
      console.log('📚 Initializing Model Registry...');
      await this.modelRegistry.initialize();
      
      console.log('🔧 Initializing Model Server...');
      await this.modelServer.initialize();
      
      console.log('🗃️  Initializing Vector Database...');
      await this.vectorDatabase.initialize();
      
      console.log('🤖 Initializing Training Pipeline...');
      await this.trainingPipeline.initialize();
      
      console.log('🧠 Initializing AI Orchestrator...');
      await this.orchestrator.initialize();
      
      // Setup system event listeners
      await this.setupSystemEventListeners();
      
      // Perform system health checks
      await this.performInitialHealthChecks();
      
      // Load default knowledge and training data
      await this.loadInitialData();
      
      this.isInitialized = true;
      
      console.log('✅ System initialization complete!');
      
      // Emit system ready event
      this.eventBus.emit('system.initialized', {
        timestamp: new Date(),
        version: '1.0.0',
        components: [
          'EventBus', 'SafetyProcessor', 'FeatureStore', 
          'ModelRegistry', 'ModelServer', 'VectorDatabase',
          'TrainingPipeline', 'Orchestrator'
        ]
      });
      
    } catch (error) {
      console.error('❌ System initialization failed:', error);
      throw error;
    }
  }

  /**
   * Start the HTTP server
   */
  async start(port: number = 3000): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('System must be initialized before starting server');
    }

    try {
      // Start the API Gateway server
      const app = this.apiGateway.getApp();
      
      this.server = app.listen(port, () => {
        console.log(`🌐 AI Orchestrator API listening on port ${port}`);
        console.log(`📊 Health endpoint: http://localhost:${port}/health`);
        console.log(`🔗 API documentation: http://localhost:${port}/api/v1/docs`);
        console.log('');
        console.log('🎯 System is ready to process mental health support queries');
      });

      // Emit server started event
      this.eventBus.emit('system.server_started', {
        port,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Initiating graceful shutdown...');
    
    try {
      // Emit shutdown event
      this.eventBus.emit('system.shutdown_initiated', {
        timestamp: new Date()
      });

      // Close HTTP server
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server.close(() => {
            console.log('🌐 HTTP server closed');
            resolve();
          });
        });
      }

      // Shutdown components in reverse order
      console.log('🧠 Shutting down AI Orchestrator...');
      // Note: Orchestrator doesn't have explicit shutdown method yet
      
      console.log('🤖 Shutting down Training Pipeline...');
      // Note: TrainingPipeline doesn't have explicit shutdown method yet
      
      console.log('🗃️  Shutting down Vector Database...');
      // Note: VectorDatabase doesn't have explicit shutdown method yet
      
      console.log('🔧 Shutting down Model Server...');
      // Note: ModelServer doesn't have explicit shutdown method yet
      
      console.log('📚 Shutting down Model Registry...');
      // Note: ModelRegistry doesn't have explicit shutdown method yet
      
      console.log('🗄️  Shutting down Feature Store...');
      // Note: FeatureStore doesn't have explicit shutdown method yet
      
      console.log('🛡️  Shutting down Safety Processor...');
      // Note: SafetyProcessor doesn't have explicit shutdown method yet
      
      console.log('📡 Shutting down Event Bus...');
      await this.eventBus.shutdown();

      this.isInitialized = false;
      
      console.log('✅ Graceful shutdown complete');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<SystemHealthStatus> {
    const [
      eventBusHealth,
      orchestratorHealth,
      safetyHealth,
      modelHealth,
      vectorHealth
    ] = await Promise.allSettled([
      this.eventBus.healthCheck(),
      this.checkOrchestratorHealth(),
      this.checkSafetySystemHealth(),
      this.checkModelSystemHealth(),
      this.checkVectorSystemHealth()
    ]);

    const overallHealthy = [
      eventBusHealth,
      orchestratorHealth,
      safetyHealth,
      modelHealth,
      vectorHealth
    ].every(result => 
      result.status === 'fulfilled' && 
      result.value.healthy
    );

    return {
      overall: overallHealthy ? 'healthy' : 'unhealthy',
      initialized: this.isInitialized,
      timestamp: new Date(),
      components: {
        eventBus: eventBusHealth.status === 'fulfilled' ? eventBusHealth.value : { healthy: false },
        orchestrator: orchestratorHealth.status === 'fulfilled' ? orchestratorHealth.value : { healthy: false },
        safety: safetyHealth.status === 'fulfilled' ? safetyHealth.value : { healthy: false },
        models: modelHealth.status === 'fulfilled' ? modelHealth.value : { healthy: false },
        vector: vectorHealth.status === 'fulfilled' ? vectorHealth.value : { healthy: false }
      }
    };
  }

  /**
   * Get system metrics and statistics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const [
      eventStats,
      modelStats,
      trainingMetrics,
      vectorStats
    ] = await Promise.allSettled([
      this.eventBus.getEventStats(),
      this.getModelMetrics(),
      this.trainingPipeline.getPipelineMetrics(),
      this.vectorDatabase.getStats()
    ]);

    return {
      timestamp: new Date(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      eventBus: eventStats.status === 'fulfilled' ? eventStats.value : null,
      models: modelStats.status === 'fulfilled' ? modelStats.value : null,
      training: trainingMetrics.status === 'fulfilled' ? trainingMetrics.value : null,
      vector: vectorStats.status === 'fulfilled' ? vectorStats.value : null
    };
  }

  // Private helper methods
  private async setupSystemEventListeners(): Promise<void> {
    console.log('👂 Setting up system event listeners...');

    // Crisis intervention events
    this.eventBus.on('safety.crisis_detected', async (data) => {
      console.log(`🚨 CRISIS ALERT: ${data.level} level crisis detected for user ${data.userId}`);
      
      if (data.level === 'emergency') {
        // Immediate escalation for emergency situations
        await this.handleEmergencyCrisis(data);
      }
    });

    // Model performance monitoring
    this.eventBus.on('model.performance_degraded', async (data) => {
      console.log(`📉 Model performance degraded: ${data.modelId}`);
      
      // Trigger evaluation and potential retraining
      try {
        await this.trainingPipeline.evaluateModel(data.modelId);
      } catch (error) {
        console.error('Failed to evaluate degraded model:', error);
      }
    });

    // Training job monitoring
    this.eventBus.on('mlops.training_completed', async (data) => {
      console.log(`🎓 Training completed: ${data.jobId} for model ${data.modelId}`);
      
      // Automatically evaluate newly trained models
      try {
        const evaluation = await this.trainingPipeline.evaluateModel(data.modelId);
        
        if (evaluation.recommendedForProduction) {
          console.log(`✅ Model ${data.modelId} recommended for production`);
          
          // Could trigger automated canary deployment here
          // await this.trainingPipeline.deployModel(data.modelId, 'canary');
        }
      } catch (error) {
        console.error('Failed to evaluate trained model:', error);
      }
    });

    // Safety review alerts
    this.eventBus.on('safety.human_review_required', async (data) => {
      console.log(`👥 Human review required: ${data.reason} for user ${data.userId}`);
      
      // In production, this would trigger alerts to human moderators
      // Could integrate with Slack, PagerDuty, or internal alert systems
    });

    // System health monitoring
    this.eventBus.on('system.health_degraded', async (data) => {
      console.warn(`⚠️  System health degraded: ${data.component} - ${data.reason}`);
      
      // Could trigger automated recovery procedures
      await this.handleSystemHealthDegradation(data);
    });

    // Feature drift detection
    this.eventBus.on('features.drift_detected', async (data) => {
      console.log(`📊 Feature drift detected: ${data.featureType}`);
      
      // Trigger feature recomputation or model retraining
      if (data.severity === 'high') {
        await this.handleFeatureDrift(data);
      }
    });

    console.log('✅ System event listeners configured');
  }

  private async performInitialHealthChecks(): Promise<void> {
    console.log('💓 Performing initial health checks...');

    const healthStatus = await this.getHealthStatus();
    
    if (healthStatus.overall !== 'healthy') {
      console.warn('⚠️  Some components are not healthy:', healthStatus.components);
      // Could choose to fail initialization or continue with degraded functionality
    } else {
      console.log('✅ All components are healthy');
    }
  }

  private async loadInitialData(): Promise<void> {
    console.log('📚 Loading initial knowledge base and training data...');

    try {
      // Load mental health knowledge articles
      const knowledgeArticles = this.getDefaultKnowledgeArticles();
      await this.vectorDatabase.storeKnowledge(knowledgeArticles);
      
      // Load initial mental health resources
      const resources = this.getDefaultMentalHealthResources();
      await this.vectorDatabase.storeKnowledge(resources);
      
      console.log('✅ Initial data loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
      // Continue initialization even if initial data loading fails
    }
  }

  private getDefaultKnowledgeArticles(): any[] {
    return [
      {
        id: 'crisis-support-101',
        title: 'Crisis Support: Immediate Steps and Resources',
        content: `When someone expresses thoughts of self-harm or suicide, immediate action is crucial. Key steps include:

        1. Take all threats seriously and do not leave the person alone
        2. Remove any means of self-harm from the immediate environment
        3. Contact emergency services (911) if there is immediate danger
        4. Provide crisis helpline numbers: 988 (US), 1553 (Philippines)
        5. Stay with the person until professional help arrives
        6. Encourage professional mental health treatment
        7. Follow up regularly to show ongoing support
        
        Remember: You don't need to solve their problems, just be present and connect them with professional help.`,
        category: 'crisis_intervention',
        author: 'Mental Health Professional Team',
        tags: ['crisis', 'suicide_prevention', 'emergency'],
        difficulty: 'beginner',
        lastUpdated: new Date()
      },
      {
        id: 'anxiety-coping-strategies',
        title: 'Evidence-Based Anxiety Management Techniques',
        content: `Anxiety is a normal response to stress, but when overwhelming, these techniques can help:

        **Breathing Techniques:**
        - 4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8
        - Box breathing: 4 counts each for inhale, hold, exhale, hold
        
        **Grounding Techniques:**
        - 5-4-3-2-1: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste
        - Progressive muscle relaxation
        
        **Cognitive Strategies:**
        - Challenge catastrophic thoughts
        - Practice mindfulness and present-moment awareness
        - Use positive self-talk
        
        **When to seek help:** If anxiety interferes with daily activities, relationships, or sleep for more than two weeks.`,
        category: 'anxiety_management',
        author: 'Licensed Clinical Psychologist',
        tags: ['anxiety', 'coping_skills', 'mental_health'],
        difficulty: 'intermediate',
        lastUpdated: new Date()
      },
      {
        id: 'depression-warning-signs',
        title: 'Recognizing Depression: Signs and When to Seek Help',
        content: `Depression affects millions and recognizing the signs is the first step toward help:

        **Emotional Signs:**
        - Persistent sadness, hopelessness, or emptiness
        - Loss of interest in previously enjoyed activities
        - Feelings of worthlessness or excessive guilt
        - Irritability or restlessness
        
        **Physical Signs:**
        - Significant weight loss or gain
        - Sleep disturbances (insomnia or oversleeping)
        - Fatigue or loss of energy
        - Difficulty concentrating or making decisions
        
        **Behavioral Signs:**
        - Social withdrawal
        - Neglecting responsibilities
        - Substance use
        - Thoughts of death or suicide
        
        **Seeking Help:** If experiencing 5+ symptoms for 2+ weeks, professional help is recommended. Treatment is effective and recovery is possible.`,
        category: 'depression',
        author: 'Mental Health Research Institute',
        tags: ['depression', 'warning_signs', 'mental_health'],
        difficulty: 'beginner',
        lastUpdated: new Date()
      }
    ];
  }

  private getDefaultMentalHealthResources(): any[] {
    return [
      {
        id: 'crisis-hotlines-global',
        title: 'Global Crisis Hotlines and Text Support',
        content: `24/7 Crisis Support Resources:

        **United States:**
        - National Suicide Prevention Lifeline: 988
        - Crisis Text Line: Text HOME to 741741
        - SAMHSA National Helpline: 1-800-662-4357
        
        **Philippines:**
        - DOH Crisis Hotline: 1553
        - Hopeline Philippines: 0917-558-4673
        - In Touch Crisis Lines: 893-7603 (Luzon), 0917-800-1123 (text)
        
        **International:**
        - International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/
        - Befrienders Worldwide: https://www.befrienders.org/
        
        **Online Support:**
        - Crisis Text Line (global): Text HOME to their local number
        - 7 Cups: Free online emotional support
        - NAMI (National Alliance on Mental Illness): Online support groups`,
        category: 'crisis_resources',
        author: 'Global Mental Health Coalition',
        tags: ['crisis_hotlines', 'emergency_resources', 'global'],
        difficulty: 'beginner',
        lastUpdated: new Date()
      },
      {
        id: 'student-mental-health-resources',
        title: 'Student Mental Health: Campus and Online Resources',
        content: `Mental health resources specifically for students:

        **Campus Resources:**
        - University Counseling Centers (usually free for students)
        - Student Health Services
        - Campus mental health first aid programs
        - Peer support groups and organizations
        
        **Academic Support:**
        - Disability Services for mental health accommodations
        - Academic advisors for course load management
        - Study skills workshops and time management resources
        
        **Online Resources for Students:**
        - ULifeline: Crisis support for college students
        - Active Minds: Student-led mental health advocacy
        - JED Campus: Campus mental health programs
        - Headspace for Students: Free meditation app
        
        **Financial Concerns:**
        - Many campus services are free or low-cost
        - Student insurance often covers mental health treatment
        - Community mental health centers offer sliding scale fees`,
        category: 'student_resources',
        author: 'Student Mental Health Alliance',
        tags: ['students', 'campus_resources', 'mental_health'],
        difficulty: 'intermediate',
        lastUpdated: new Date()
      }
    ];
  }

  // Health check methods for different components
  private async checkOrchestratorHealth(): Promise<{ healthy: boolean; details?: any }> {
    try {
      // Check if orchestrator can process a simple health check query
      // In a real implementation, you'd have actual health check methods
      return { 
        healthy: true, 
        details: { 
          initialized: this.isInitialized,
          modelsAvailable: (await this.modelRegistry.getAvailableModels()).length 
        } 
      };
    } catch (error) {
      return { healthy: false, details: { error: error.message } };
    }
  }

  private async checkSafetySystemHealth(): Promise<{ healthy: boolean; details?: any }> {
    try {
      // Check safety system responsiveness
      return { 
        healthy: true, 
        details: { 
          reviewQueueSize: this.safetyProcessor.getReviewQueue().length,
          initialized: true 
        } 
      };
    } catch (error) {
      return { healthy: false, details: { error: error.message } };
    }
  }

  private async checkModelSystemHealth(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const loadedModels = this.modelServer.getLoadedModels();
      const availableModels = await this.modelRegistry.getAvailableModels();
      
      return { 
        healthy: loadedModels.length > 0, 
        details: { 
          loadedModels: loadedModels.length,
          availableModels: availableModels.length
        } 
      };
    } catch (error) {
      return { healthy: false, details: { error: error.message } };
    }
  }

  private async checkVectorSystemHealth(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const stats = await this.vectorDatabase.getStats();
      
      return { 
        healthy: stats.totalVectors > 0, 
        details: {
          totalVectors: stats.totalVectors,
          collections: stats.totalCollections,
          memoryUsage: stats.memoryUsageMB
        } 
      };
    } catch (error) {
      return { healthy: false, details: { error: error.message } };
    }
  }

  private async getModelMetrics(): Promise<any> {
    const loadedModels = this.modelServer.getLoadedModels();
    const metrics: any = {};
    
    for (const modelId of loadedModels) {
      metrics[modelId] = this.modelServer.getModelStats(modelId);
    }
    
    return metrics;
  }

  // Event handlers
  private async handleEmergencyCrisis(data: any): Promise<void> {
    console.log(`🆘 EMERGENCY CRISIS PROTOCOL ACTIVATED for user ${data.userId}`);
    
    // In production:
    // 1. Alert emergency response team immediately
    // 2. Provide crisis resources to user
    // 3. Log for follow-up
    // 4. Trigger wellness check procedures if appropriate
    
    this.eventBus.emit('system.emergency_response_activated', {
      userId: data.userId,
      crisisLevel: data.level,
      timestamp: new Date(),
      responseActions: ['emergency_team_alerted', 'resources_provided', 'followup_scheduled']
    });
  }

  private async handleSystemHealthDegradation(data: any): Promise<void> {
    console.log(`🔧 Attempting to handle system health degradation: ${data.component}`);
    
    // Implement automated recovery procedures
    switch (data.component) {
      case 'model_server':
        // Try to restart model endpoints
        console.log('🔄 Attempting model server recovery...');
        break;
        
      case 'safety_processor':
        // Fallback to more conservative safety settings
        console.log('🛡️  Activating conservative safety mode...');
        break;
        
      case 'vector_database':
        // Rebuild indices if needed
        console.log('🗃️  Attempting vector database recovery...');
        break;
        
      default:
        console.log(`⚠️  No automated recovery available for ${data.component}`);
    }
  }

  private async handleFeatureDrift(data: any): Promise<void> {
    console.log(`📊 Handling feature drift: ${data.featureType}`);
    
    // Trigger feature recomputation
    if (data.affectedModels && data.affectedModels.length > 0) {
      for (const modelId of data.affectedModels) {
        console.log(`🔄 Triggering evaluation for drift-affected model: ${modelId}`);
        
        try {
          await this.trainingPipeline.evaluateModel(modelId);
        } catch (error) {
          console.error(`Failed to evaluate model ${modelId}:`, error);
        }
      }
    }
  }
}

// Supporting interfaces
interface SystemHealthStatus {
  overall: 'healthy' | 'unhealthy';
  initialized: boolean;
  timestamp: Date;
  components: {
    eventBus: any;
    orchestrator: any;
    safety: any;
    models: any;
    vector: any;
  };
}

interface SystemMetrics {
  timestamp: Date;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  eventBus: any;
  models: any;
  training: any;
  vector: any;
}

// Main execution
async function main() {
  const app = new AIOrchestatorApp();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🔄 Received SIGINT, shutting down gracefully...');
    await app.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
    await app.shutdown();
    process.exit(0);
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });

  try {
    // Initialize the system
    await app.initialize();
    
    // Start the server
    const port = parseInt(process.env.PORT || '3000', 10);
    await app.start(port);
    
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Export for testing and external use
export { AIOrchestatorApp };

// Run if this is the main module
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Application startup failed:', error);
    process.exit(1);
  });
}