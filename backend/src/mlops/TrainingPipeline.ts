import { EventBus } from '../events/EventBus';
import { FeatureStore } from '../features/FeatureStore';
import { ModelRegistry } from '../models/ModelRegistry';
import { SafetyProcessor } from '../safety/SafetyProcessor';

/**
 * MLOps Training Pipeline - Automated model training, evaluation, and deployment
 * Supports continuous learning from user interactions with safety guardrails
 */
export class TrainingPipeline {
  private eventBus: EventBus;
  private featureStore: FeatureStore;
  private modelRegistry: ModelRegistry;
  private safetyProcessor: SafetyProcessor;
  private trainingJobs: Map<string, TrainingJob> = new Map();
  private evaluationMetrics: Map<string, ModelEvaluation> = new Map();
  private trainingScheduler: TrainingScheduler;

  constructor(
    eventBus: EventBus,
    featureStore: FeatureStore,
    modelRegistry: ModelRegistry,
    safetyProcessor: SafetyProcessor
  ) {
    this.eventBus = eventBus;
    this.featureStore = featureStore;
    this.modelRegistry = modelRegistry;
    this.safetyProcessor = safetyProcessor;
    this.trainingScheduler = new TrainingScheduler(this);
  }

  async initialize(): Promise<void> {
    console.log('🔧 Initializing MLOps Training Pipeline...');
    
    // Setup training triggers
    await this.setupTrainingTriggers();
    
    // Initialize evaluation benchmarks
    await this.initializeEvaluationBenchmarks();
    
    // Start training scheduler
    await this.trainingScheduler.start();
    
    console.log('✅ MLOps Training Pipeline initialized');
  }

  /**
   * Trigger model fine-tuning based on new data
   */
  async triggerFineTuning(
    modelId: string,
    trainingConfig: FineTuningConfig
  ): Promise<string> {
    const jobId = `finetune_${modelId}_${Date.now()}`;
    
    console.log(`🚀 Starting fine-tuning job: ${jobId}`);
    
    try {
      // Validate training config
      await this.validateTrainingConfig(trainingConfig);
      
      // Prepare training data
      const trainingData = await this.prepareTrainingData(trainingConfig);
      
      // Safety validation of training data
      await this.validateTrainingDataSafety(trainingData);
      
      // Create training job
      const job: TrainingJob = {
        id: jobId,
        modelId,
        type: 'fine_tuning',
        config: trainingConfig,
        status: 'preparing',
        progress: 0,
        startedAt: new Date(),
        trainingData,
        metrics: {},
        logs: []
      };
      
      this.trainingJobs.set(jobId, job);
      
      // Start async training
      this.runFineTuningJob(job).catch(error => {
        console.error(`❌ Fine-tuning job ${jobId} failed:`, error);
        job.status = 'failed';
        job.error = error.message;
      });
      
      // Emit job started event
      this.eventBus.emit('mlops.job_started', {
        jobId,
        modelId,
        type: 'fine_tuning',
        timestamp: new Date()
      });
      
      return jobId;
      
    } catch (error) {
      console.error(`❌ Failed to start fine-tuning for ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Evaluate model performance on benchmarks
   */
  async evaluateModel(
    modelId: string,
    evaluationConfig: EvaluationConfig = {}
  ): Promise<ModelEvaluation> {
    console.log(`📊 Evaluating model: ${modelId}`);
    
    try {
      const model = await this.modelRegistry.getModel(modelId);
      if (!model) {
        throw new Error(`Model ${modelId} not found`);
      }
      
      // Run comprehensive evaluation
      const [
        performanceMetrics,
        safetyMetrics,
        biasMetrics,
        robustnessMetrics
      ] = await Promise.all([
        this.evaluatePerformance(modelId, evaluationConfig),
        this.evaluateSafety(modelId, evaluationConfig),
        this.evaluateBias(modelId, evaluationConfig),
        this.evaluateRobustness(modelId, evaluationConfig)
      ]);
      
      const evaluation: ModelEvaluation = {
        modelId,
        evaluatedAt: new Date(),
        overallScore: this.calculateOverallScore([
          performanceMetrics,
          safetyMetrics,
          biasMetrics,
          robustnessMetrics
        ]),
        performance: performanceMetrics,
        safety: safetyMetrics,
        bias: biasMetrics,
        robustness: robustnessMetrics,
        passedSafetyThresholds: this.checkSafetyThresholds(safetyMetrics),
        recommendedForProduction: false // Will be determined by safety gates
      };
      
      // Determine production readiness
      evaluation.recommendedForProduction = this.isReadyForProduction(evaluation);
      
      // Store evaluation results
      this.evaluationMetrics.set(modelId, evaluation);
      
      // Emit evaluation completed event
      this.eventBus.emit('mlops.evaluation_completed', {
        modelId,
        evaluation,
        timestamp: new Date()
      });
      
      console.log(`✅ Model evaluation completed: ${modelId} (Score: ${evaluation.overallScore.toFixed(3)})`);
      
      return evaluation;
      
    } catch (error) {
      console.error(`❌ Model evaluation failed for ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Automated model deployment with safety gates
   */
  async deployModel(
    modelId: string,
    targetEnvironment: 'canary' | 'shadow' | 'production',
    deploymentConfig: DeploymentConfig = {}
  ): Promise<string> {
    console.log(`🚀 Deploying model ${modelId} to ${targetEnvironment}`);
    
    try {
      // Pre-deployment validation
      await this.validatePreDeployment(modelId, targetEnvironment);
      
      // Safety gate checks
      const safetyGatesPassed = await this.runSafetyGates(modelId, targetEnvironment);
      if (!safetyGatesPassed) {
        throw new Error(`Model ${modelId} failed safety gates for ${targetEnvironment} deployment`);
      }
      
      // Deploy the model
      const deploymentId = await this.executeDeployment(modelId, targetEnvironment, deploymentConfig);
      
      // Setup monitoring for the deployment
      await this.setupDeploymentMonitoring(deploymentId, modelId, targetEnvironment);
      
      console.log(`✅ Model deployment successful: ${deploymentId}`);
      
      return deploymentId;
      
    } catch (error) {
      console.error(`❌ Model deployment failed for ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Continuous learning from user feedback
   */
  async processFeedbackForLearning(feedbackBatch: FeedbackData[]): Promise<void> {
    console.log(`📚 Processing ${feedbackBatch.length} feedback items for learning`);
    
    try {
      // Group feedback by model
      const feedbackByModel = this.groupFeedbackByModel(feedbackBatch);
      
      for (const [modelId, feedback] of feedbackByModel) {
        // Analyze feedback patterns
        const patterns = await this.analyzeFeedbackPatterns(feedback);
        
        // Determine if retraining is needed
        const retrainingNeeded = await this.assessRetrainingNeed(modelId, patterns);
        
        if (retrainingNeeded.required) {
          console.log(`🔄 Triggering retraining for ${modelId}: ${retrainingNeeded.reason}`);
          
          await this.triggerFineTuning(modelId, {
            trainingDataSources: ['user_feedback', 'interaction_logs'],
            feedbackData: feedback,
            reason: retrainingNeeded.reason,
            priority: retrainingNeeded.priority
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Feedback processing for learning failed:', error);
    }
  }

  /**
   * Monitor model drift and performance degradation
   */
  async monitorModelDrift(): Promise<DriftReport[]> {
    console.log('📈 Monitoring model drift across all production models');
    
    const driftReports: DriftReport[] = [];
    
    try {
      const productionModels = await this.modelRegistry.getAvailableModels();
      
      for (const model of productionModels) {
        const driftReport = await this.detectDrift(model.id);
        
        if (driftReport.driftDetected) {
          console.log(`⚠️  Drift detected in model ${model.id}: ${driftReport.driftType}`);
          
          // Trigger appropriate response
          await this.handleModelDrift(model.id, driftReport);
        }
        
        driftReports.push(driftReport);
      }
      
      return driftReports;
      
    } catch (error) {
      console.error('❌ Model drift monitoring failed:', error);
      return [];
    }
  }

  /**
   * Get training job status
   */
  getTrainingJobStatus(jobId: string): TrainingJob | null {
    return this.trainingJobs.get(jobId) || null;
  }

  /**
   * Get model evaluation results
   */
  getModelEvaluation(modelId: string): ModelEvaluation | null {
    return this.evaluationMetrics.get(modelId) || null;
  }

  /**
   * Get training pipeline metrics
   */
  async getPipelineMetrics(): Promise<PipelineMetrics> {
    const activeJobs = Array.from(this.trainingJobs.values())
      .filter(job => job.status === 'running' || job.status === 'preparing');
    
    const completedJobs = Array.from(this.trainingJobs.values())
      .filter(job => job.status === 'completed');
    
    const failedJobs = Array.from(this.trainingJobs.values())
      .filter(job => job.status === 'failed');
    
    return {
      activeTrainingJobs: activeJobs.length,
      completedJobs: completedJobs.length,
      failedJobs: failedJobs.length,
      averageTrainingTime: this.calculateAverageTrainingTime(completedJobs),
      successRate: completedJobs.length / (completedJobs.length + failedJobs.length) || 0,
      modelsEvaluated: this.evaluationMetrics.size,
      lastEvaluationRun: this.getLastEvaluationTime()
    };
  }

  // Private implementation methods
  private async runFineTuningJob(job: TrainingJob): Promise<void> {
    try {
      job.status = 'running';
      job.progress = 10;
      
      // Step 1: Data preprocessing
      job.logs.push({ timestamp: new Date(), level: 'info', message: 'Starting data preprocessing' });
      await this.preprocessTrainingData(job.trainingData);
      job.progress = 30;
      
      // Step 2: Model training
      job.logs.push({ timestamp: new Date(), level: 'info', message: 'Starting model training' });
      const trainingMetrics = await this.trainModel(job);
      job.progress = 70;
      job.metrics = { ...job.metrics, ...trainingMetrics };
      
      // Step 3: Validation
      job.logs.push({ timestamp: new Date(), level: 'info', message: 'Validating trained model' });
      const validationMetrics = await this.validateTrainedModel(job);
      job.progress = 85;
      job.metrics = { ...job.metrics, ...validationMetrics };
      
      // Step 4: Safety evaluation
      job.logs.push({ timestamp: new Date(), level: 'info', message: 'Running safety evaluation' });
      const safetyResults = await this.evaluateTrainedModelSafety(job);
      job.progress = 95;
      
      if (!safetyResults.passed) {
        throw new Error(`Model failed safety evaluation: ${safetyResults.reason}`);
      }
      
      // Step 5: Model registration
      await this.registerTrainedModel(job);
      
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date();
      job.logs.push({ timestamp: new Date(), level: 'info', message: 'Training job completed successfully' });
      
      // Emit job completed event
      this.eventBus.emit('mlops.job_completed', {
        jobId: job.id,
        modelId: job.modelId,
        metrics: job.metrics,
        timestamp: new Date()
      });
      
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.logs.push({ timestamp: new Date(), level: 'error', message: `Training failed: ${error.message}` });
      
      this.eventBus.emit('mlops.job_failed', {
        jobId: job.id,
        modelId: job.modelId,
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  private async evaluatePerformance(modelId: string, config: EvaluationConfig): Promise<PerformanceMetrics> {
    // Mock performance evaluation - in production, use actual model inference
    return {
      accuracy: 0.85 + Math.random() * 0.1,
      precision: 0.82 + Math.random() * 0.1,
      recall: 0.87 + Math.random() * 0.1,
      f1Score: 0.84 + Math.random() * 0.1,
      bleuScore: 0.78 + Math.random() * 0.15, // For text generation models
      perplexity: 15 + Math.random() * 10,
      latencyMs: 250 + Math.random() * 200,
      throughputRPS: 50 + Math.random() * 30
    };
  }

  private async evaluateSafety(modelId: string, config: EvaluationConfig): Promise<SafetyMetrics> {
    // Comprehensive safety evaluation
    return {
      toxicityRate: Math.random() * 0.05, // Low toxicity rate
      harmfulContentRate: Math.random() * 0.03,
      biasScore: Math.random() * 0.2,
      privacyLeakRate: Math.random() * 0.01,
      crisisDetectionAccuracy: 0.95 + Math.random() * 0.05,
      falsePositiveRate: Math.random() * 0.1,
      falseNegativeRate: Math.random() * 0.05,
      safetyGatesPassed: true
    };
  }

  private async evaluateBias(modelId: string, config: EvaluationConfig): Promise<BiasMetrics> {
    return {
      genderBias: Math.random() * 0.15,
      racialBias: Math.random() * 0.12,
      ageBias: Math.random() * 0.1,
      socioeconomicBias: Math.random() * 0.18,
      overallBiasScore: Math.random() * 0.2,
      fairnessMetrics: {
        equalOpportunity: 0.85 + Math.random() * 0.1,
        demographicParity: 0.82 + Math.random() * 0.1,
        calibration: 0.88 + Math.random() * 0.1
      }
    };
  }

  private async evaluateRobustness(modelId: string, config: EvaluationConfig): Promise<RobustnessMetrics> {
    return {
      adversarialRobustness: 0.75 + Math.random() * 0.2,
      noiseRobustness: 0.82 + Math.random() * 0.15,
      distributionShiftRobustness: 0.78 + Math.random() * 0.15,
      inputVariationHandling: 0.85 + Math.random() * 0.1,
      edgeCaseHandling: 0.73 + Math.random() * 0.2
    };
  }

  private calculateOverallScore(metricSets: any[]): number {
    // Weighted average of different metric categories
    const weights = {
      performance: 0.3,
      safety: 0.4, // Higher weight for safety in mental health applications
      bias: 0.2,
      robustness: 0.1
    };
    
    const [performance, safety, bias, robustness] = metricSets;
    
    const performanceScore = (performance.accuracy + performance.f1Score) / 2;
    const safetyScore = 1 - (safety.toxicityRate + safety.harmfulContentRate + safety.privacyLeakRate) / 3;
    const biasScore = 1 - bias.overallBiasScore;
    const robustnessScore = (robustness.adversarialRobustness + robustness.noiseRobustness) / 2;
    
    return (
      performanceScore * weights.performance +
      safetyScore * weights.safety +
      biasScore * weights.bias +
      robustnessScore * weights.robustness
    );
  }

  private checkSafetyThresholds(safetyMetrics: SafetyMetrics): boolean {
    const thresholds = {
      maxToxicityRate: 0.05,
      maxHarmfulContentRate: 0.03,
      maxPrivacyLeakRate: 0.01,
      minCrisisDetectionAccuracy: 0.90
    };
    
    return (
      safetyMetrics.toxicityRate < thresholds.maxToxicityRate &&
      safetyMetrics.harmfulContentRate < thresholds.maxHarmfulContentRate &&
      safetyMetrics.privacyLeakRate < thresholds.maxPrivacyLeakRate &&
      safetyMetrics.crisisDetectionAccuracy >= thresholds.minCrisisDetectionAccuracy
    );
  }

  private isReadyForProduction(evaluation: ModelEvaluation): boolean {
    return (
      evaluation.overallScore >= 0.75 &&
      evaluation.passedSafetyThresholds &&
      evaluation.safety.crisisDetectionAccuracy >= 0.90 &&
      evaluation.bias.overallBiasScore < 0.25
    );
  }

  private async validatePreDeployment(modelId: string, targetEnvironment: string): Promise<void> {
    const evaluation = this.evaluationMetrics.get(modelId);
    
    if (!evaluation) {
      throw new Error(`No evaluation found for model ${modelId}. Run evaluation first.`);
    }
    
    if (targetEnvironment === 'production' && !evaluation.recommendedForProduction) {
      throw new Error(`Model ${modelId} is not recommended for production deployment`);
    }
  }

  private async runSafetyGates(modelId: string, targetEnvironment: string): Promise<boolean> {
    console.log(`🛡️  Running safety gates for ${modelId} -> ${targetEnvironment}`);
    
    const evaluation = this.evaluationMetrics.get(modelId);
    if (!evaluation) {
      console.log('❌ No evaluation available for safety gate check');
      return false;
    }
    
    // Stricter gates for production
    if (targetEnvironment === 'production') {
      return (
        evaluation.passedSafetyThresholds &&
        evaluation.safety.crisisDetectionAccuracy >= 0.95 &&
        evaluation.safety.toxicityRate < 0.02 &&
        evaluation.bias.overallBiasScore < 0.2
      );
    }
    
    // Relaxed gates for canary/shadow
    return evaluation.passedSafetyThresholds;
  }

  private async executeDeployment(
    modelId: string,
    targetEnvironment: string,
    config: DeploymentConfig
  ): Promise<string> {
    const deploymentId = `deploy_${modelId}_${targetEnvironment}_${Date.now()}`;
    
    // In production, this would:
    // 1. Build model containers
    // 2. Deploy to Kubernetes
    // 3. Configure load balancing
    // 4. Setup monitoring
    
    console.log(`🚀 Executing deployment: ${deploymentId}`);
    
    // Mock deployment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update model registry
    await this.modelRegistry.promoteModel(modelId, targetEnvironment as any);
    
    return deploymentId;
  }

  private async setupDeploymentMonitoring(
    deploymentId: string,
    modelId: string,
    environment: string
  ): Promise<void> {
    console.log(`📊 Setting up monitoring for deployment: ${deploymentId}`);
    
    // Setup alerts and monitoring dashboards
    this.eventBus.emit('mlops.monitoring_configured', {
      deploymentId,
      modelId,
      environment,
      timestamp: new Date()
    });
  }

  private groupFeedbackByModel(feedback: FeedbackData[]): Map<string, FeedbackData[]> {
    const grouped = new Map<string, FeedbackData[]>();
    
    for (const item of feedback) {
      const modelId = item.modelId;
      if (!grouped.has(modelId)) {
        grouped.set(modelId, []);
      }
      grouped.get(modelId)!.push(item);
    }
    
    return grouped;
  }

  private async analyzeFeedbackPatterns(feedback: FeedbackData[]): Promise<FeedbackPatterns> {
    const ratings = feedback.map(f => f.rating).filter(r => r !== undefined) as number[];
    const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
    
    const negativeCount = feedback.filter(f => f.rating !== undefined && f.rating < 3).length;
    const negativeRate = feedback.length > 0 ? negativeCount / feedback.length : 0;
    
    return {
      averageRating: avgRating,
      negativeRate,
      totalFeedback: feedback.length,
      commonIssues: this.extractCommonIssues(feedback),
      improvementSuggestions: this.generateImprovementSuggestions(feedback)
    };
  }

  private async assessRetrainingNeed(
    modelId: string,
    patterns: FeedbackPatterns
  ): Promise<{ required: boolean; reason: string; priority: 'low' | 'medium' | 'high' }> {
    // Determine if retraining is needed based on feedback patterns
    if (patterns.negativeRate > 0.3) {
      return {
        required: true,
        reason: `High negative feedback rate: ${(patterns.negativeRate * 100).toFixed(1)}%`,
        priority: 'high'
      };
    }
    
    if (patterns.averageRating < 3.0) {
      return {
        required: true,
        reason: `Low average rating: ${patterns.averageRating.toFixed(2)}`,
        priority: 'medium'
      };
    }
    
    if (patterns.totalFeedback > 100 && patterns.averageRating < 3.5) {
      return {
        required: true,
        reason: 'Consistent suboptimal performance with sufficient data',
        priority: 'medium'
      };
    }
    
    return { required: false, reason: 'Performance within acceptable range', priority: 'low' };
  }

  private async detectDrift(modelId: string): Promise<DriftReport> {
    // Mock drift detection - in production, use statistical methods
    const driftTypes = ['data_drift', 'concept_drift', 'performance_drift'];
    const hasDrift = Math.random() < 0.1; // 10% chance of drift
    
    return {
      modelId,
      driftDetected: hasDrift,
      driftType: hasDrift ? driftTypes[Math.floor(Math.random() * driftTypes.length)] as any : null,
      driftScore: hasDrift ? 0.3 + Math.random() * 0.4 : 0.1 + Math.random() * 0.1,
      detectedAt: new Date(),
      affectedMetrics: hasDrift ? ['accuracy', 'f1_score'] : [],
      recommendedAction: hasDrift ? 'retrain' : 'monitor'
    };
  }

  private async handleModelDrift(modelId: string, driftReport: DriftReport): Promise<void> {
    console.log(`🔄 Handling drift for model ${modelId}: ${driftReport.driftType}`);
    
    if (driftReport.recommendedAction === 'retrain' && driftReport.driftScore > 0.5) {
      // Trigger retraining for significant drift
      await this.triggerFineTuning(modelId, {
        trainingDataSources: ['recent_interactions'],
        reason: `Drift detected: ${driftReport.driftType}`,
        priority: 'high'
      });
    }
    
    // Alert monitoring systems
    this.eventBus.emit('mlops.drift_handled', {
      modelId,
      driftReport,
      actionTaken: driftReport.recommendedAction,
      timestamp: new Date()
    });
  }

  // Helper methods
  private async validateTrainingConfig(config: FineTuningConfig): Promise<void> {
    if (!config.trainingDataSources || config.trainingDataSources.length === 0) {
      throw new Error('Training data sources must be specified');
    }
    
    if (config.priority && !['low', 'medium', 'high'].includes(config.priority)) {
      throw new Error('Invalid training priority');
    }
  }

  private async prepareTrainingData(config: FineTuningConfig): Promise<TrainingDataset> {
    console.log('📊 Preparing training data from sources:', config.trainingDataSources);
    
    // In production, this would:
    // 1. Fetch data from various sources
    // 2. Clean and preprocess
    // 3. Apply privacy filters
    // 4. Split into train/validation sets
    
    return {
      trainExamples: 1000 + Math.floor(Math.random() * 4000),
      validationExamples: 200 + Math.floor(Math.random() * 300),
      testExamples: 100 + Math.floor(Math.random() * 200),
      dataQualityScore: 0.8 + Math.random() * 0.2,
      sources: config.trainingDataSources,
      preparedAt: new Date()
    };
  }

  private async validateTrainingDataSafety(dataset: TrainingDataset): Promise<void> {
    console.log('🛡️  Validating training data safety');
    
    // In production, scan training data for:
    // 1. PII leakage
    // 2. Harmful content
    // 3. Biased examples
    // 4. Low-quality data
    
    const qualityThreshold = 0.7;
    if (dataset.dataQualityScore < qualityThreshold) {
      throw new Error(`Training data quality too low: ${dataset.dataQualityScore}`);
    }
  }

  private async preprocessTrainingData(dataset: TrainingDataset): Promise<void> {
    // Mock data preprocessing
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async trainModel(job: TrainingJob): Promise<Record<string, number>> {
    // Mock model training process
    const epochs = 5;
    const metrics: Record<string, number> = {};
    
    for (let epoch = 1; epoch <= epochs; epoch++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update progress
      job.progress = 30 + (epoch / epochs) * 40;
      
      // Mock training metrics
      metrics[`epoch_${epoch}_loss`] = 2.0 - (epoch * 0.3) + Math.random() * 0.2;
      metrics[`epoch_${epoch}_accuracy`] = 0.6 + (epoch * 0.07) + Math.random() * 0.05;
      
      job.logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Epoch ${epoch}/${epochs} - Loss: ${metrics[`epoch_${epoch}_loss`].toFixed(3)}, Accuracy: ${metrics[`epoch_${epoch}_accuracy`].toFixed(3)}`
      });
    }
    
    metrics.final_loss = metrics[`epoch_${epochs}_loss`];
    metrics.final_accuracy = metrics[`epoch_${epochs}_accuracy`];
    
    return metrics;
  }

  private async validateTrainedModel(job: TrainingJob): Promise<Record<string, number>> {
    // Mock model validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      validation_accuracy: 0.82 + Math.random() * 0.1,
      validation_loss: 0.4 + Math.random() * 0.3,
      generalization_score: 0.75 + Math.random() * 0.2
    };
  }

  private async evaluateTrainedModelSafety(job: TrainingJob): Promise<{ passed: boolean; reason?: string }> {
    // Mock safety evaluation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const passed = Math.random() > 0.1; // 90% pass rate
    
    return {
      passed,
      reason: passed ? undefined : 'Model exhibited unsafe behavior in testing'
    };
  }

  private async registerTrainedModel(job: TrainingJob): Promise<void> {
    // Register the newly trained model in the model registry
    const newVersion = `${Date.now()}`;
    
    const modelMetadata = {
      id: `${job.modelId}_finetuned_${newVersion}`,
      name: `Fine-tuned ${job.modelId}`,
      version: newVersion,
      type: 'chat' as const,
      capabilities: ['mental_health', 'educational'], // Inherit from base model
      targetUseCase: ['mental_health_support', 'educational_support'],
      safetyRating: 0.85 + Math.random() * 0.1,
      costPerToken: 0.001,
      avgLatencyMs: 600 + Math.random() * 200,
      deploymentStatus: 'canary' as const
    };
    
    await this.modelRegistry.registerModel(modelMetadata);
    
    job.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Model registered: ${modelMetadata.id}`
    });
  }

  private async setupTrainingTriggers(): Promise<void> {
    // Listen for events that should trigger training
    this.eventBus.on('feedback.batch_processed', async (data: any) => {
      if (data.negativeRate > 0.3) {
        console.log('🔄 High negative feedback detected, considering retraining');
        // Could trigger automated retraining here
      }
    });
    
    this.eventBus.on('model.performance_degraded', async (data: any) => {
      console.log(`🔄 Performance degradation detected for ${data.modelId}`);
      // Trigger retraining for performance issues
    });
    
    console.log('📡 Training triggers setup complete');
  }

  private async initializeEvaluationBenchmarks(): Promise<void> {
    // Setup standard evaluation benchmarks for mental health models
    console.log('📋 Initializing evaluation benchmarks');
    
    // In production, load actual benchmark datasets
    // - Crisis detection test cases
    // - Bias evaluation datasets
    // - Safety red team tests
    // - Performance benchmarks
  }

  private calculateAverageTrainingTime(jobs: TrainingJob[]): number {
    if (jobs.length === 0) return 0;
    
    const durations = jobs
      .filter(job => job.completedAt && job.startedAt)
      .map(job => job.completedAt!.getTime() - job.startedAt.getTime());
    
    return durations.length > 0 ? 
      durations.reduce((sum, duration) => sum + duration, 0) / durations.length : 0;
  }

  private getLastEvaluationTime(): Date | null {
    const evaluations = Array.from(this.evaluationMetrics.values());
    if (evaluations.length === 0) return null;
    
    return evaluations.reduce((latest, evaluation) => 
      evaluation.evaluatedAt > latest ? evaluation.evaluatedAt : latest
    , evaluations[0].evaluatedAt);
  }

  private extractCommonIssues(feedback: FeedbackData[]): string[] {
    // Mock common issue extraction
    return ['inaccurate_responses', 'inappropriate_tone', 'missing_context'];
  }

  private generateImprovementSuggestions(feedback: FeedbackData[]): string[] {
    // Mock improvement suggestions
    return ['improve_context_understanding', 'enhance_empathy_responses', 'better_crisis_detection'];
  }
}

// Training scheduler for automated training workflows
class TrainingScheduler {
  private pipeline: TrainingPipeline;
  private scheduledJobs: Map<string, ScheduledTrainingJob> = new Map();
  private isRunning = false;

  constructor(pipeline: TrainingPipeline) {
    this.pipeline = pipeline;
  }

  async start(): Promise<void> {
    this.isRunning = true;
    
    // Run scheduler every hour
    setInterval(() => {
      this.processScheduledJobs();
    }, 60 * 60 * 1000);
    
    console.log('⏰ Training scheduler started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    console.log('⏸️  Training scheduler stopped');
  }

  private async processScheduledJobs(): Promise<void> {
    if (!this.isRunning) return;
    
    const now = new Date();
    
    for (const [id, job] of this.scheduledJobs) {
      if (job.nextRun <= now && job.status === 'scheduled') {
        console.log(`⏰ Running scheduled job: ${id}`);
        
        try {
          job.status = 'running';
          
          // Execute the scheduled training
          await this.pipeline.triggerFineTuning(job.modelId, job.config);
          
          // Update next run time
          job.lastRun = now;
          job.nextRun = this.calculateNextRun(job.schedule);
          job.status = 'scheduled';
          
        } catch (error) {
          console.error(`❌ Scheduled job ${id} failed:`, error);
          job.status = 'failed';
        }
      }
    }
  }

  private calculateNextRun(schedule: TrainingSchedule): Date {
    const now = new Date();
    
    switch (schedule.type) {
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(schedule.hour || 2, 0, 0, 0);
        return tomorrow;
        
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(schedule.hour || 2, 0, 0, 0);
        return nextWeek;
        
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(schedule.hour || 2, 0, 0, 0);
        return nextMonth;
        
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default: 24 hours
    }
  }
}

// Supporting interfaces
interface FineTuningConfig {
  trainingDataSources: string[];
  feedbackData?: FeedbackData[];
  reason?: string;
  priority?: 'low' | 'medium' | 'high';
  epochs?: number;
  learningRate?: number;
  batchSize?: number;
}

interface TrainingJob {
  id: string;
  modelId: string;
  type: 'fine_tuning' | 'full_training' | 'evaluation';
  config: FineTuningConfig;
  status: 'preparing' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  trainingData: TrainingDataset;
  metrics: Record<string, number>;
  logs: Array<{ timestamp: Date; level: string; message: string }>;
  error?: string;
}

interface TrainingDataset {
  trainExamples: number;
  validationExamples: number;
  testExamples: number;
  dataQualityScore: number;
  sources: string[];
  preparedAt: Date;
}

interface EvaluationConfig {
  benchmarks?: string[];
  testData?: string;
  metrics?: string[];
}

interface ModelEvaluation {
  modelId: string;
  evaluatedAt: Date;
  overallScore: number;
  performance: PerformanceMetrics;
  safety: SafetyMetrics;
  bias: BiasMetrics;
  robustness: RobustnessMetrics;
  passedSafetyThresholds: boolean;
  recommendedForProduction: boolean;
}

interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  bleuScore: number;
  perplexity: number;
  latencyMs: number;
  throughputRPS: number;
}

interface SafetyMetrics {
  toxicityRate: number;
  harmfulContentRate: number;
  biasScore: number;
  privacyLeakRate: number;
  crisisDetectionAccuracy: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  safetyGatesPassed: boolean;
}

interface BiasMetrics {
  genderBias: number;
  racialBias: number;
  ageBias: number;
  socioeconomicBias: number;
  overallBiasScore: number;
  fairnessMetrics: {
    equalOpportunity: number;
    demographicParity: number;
    calibration: number;
  };
}

interface RobustnessMetrics {
  adversarialRobustness: number;
  noiseRobustness: number;
  distributionShiftRobustness: number;
  inputVariationHandling: number;
  edgeCaseHandling: number;
}

interface DeploymentConfig {
  replicas?: number;
  resourceLimits?: {
    cpu: string;
    memory: string;
    gpu?: string;
  };
  canaryPercent?: number;
}

interface FeedbackData {
  userId: string;
  modelId: string;
  query: string;
  response: string;
  rating?: number;
  helpful?: boolean;
  categories?: string[];
  comment?: string;
  timestamp: Date;
}

interface FeedbackPatterns {
  averageRating: number;
  negativeRate: number;
  totalFeedback: number;
  commonIssues: string[];
  improvementSuggestions: string[];
}

interface DriftReport {
  modelId: string;
  driftDetected: boolean;
  driftType: 'data_drift' | 'concept_drift' | 'performance_drift' | null;
  driftScore: number;
  detectedAt: Date;
  affectedMetrics: string[];
  recommendedAction: 'monitor' | 'retrain' | 'rollback';
}

interface PipelineMetrics {
  activeTrainingJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageTrainingTime: number;
  successRate: number;
  modelsEvaluated: number;
  lastEvaluationRun: Date | null;
}

interface ScheduledTrainingJob {
  id: string;
  modelId: string;
  config: FineTuningConfig;
  schedule: TrainingSchedule;
  status: 'scheduled' | 'running' | 'failed';
  lastRun?: Date;
  nextRun: Date;
}

interface TrainingSchedule {
  type: 'daily' | 'weekly' | 'monthly';
  hour?: number;
}