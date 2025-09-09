/**
 * Event Bus - Central event-driven architecture for the AI Orchestrator
 * Handles real-time communication between all system components
 */
export class EventBus {
  private listeners: Map<string, EventListener[]> = new Map();
  private eventHistory: Map<string, StoredEvent[]> = new Map();
  private eventStats: Map<string, EventStats> = new Map();
  private isInitialized = false;
  private maxHistorySize = 1000;
  private retryQueue: Map<string, RetryableEvent> = new Map();

  constructor() {
    this.setupInternalEvents();
  }

  async initialize(): Promise<void> {
    console.log('📡 Initializing Event Bus...');
    
    // Start retry processing
    this.startRetryProcessor();
    
    // Start event cleanup
    this.startEventCleanup();
    
    this.isInitialized = true;
    console.log('✅ Event Bus initialized');
    
    // Emit initialization event
    this.emit('eventbus.initialized', {
      timestamp: new Date(),
      version: '1.0.0'
    });
  }

  /**
   * Subscribe to events
   */
  on(eventType: string, listener: EventListenerCallback): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const eventListener: EventListener = {
      id: this.generateListenerId(),
      callback: listener,
      registeredAt: new Date(),
      callCount: 0,
      lastCalled: null,
      errorCount: 0
    };

    this.listeners.get(eventType)!.push(eventListener);

    console.log(`👂 Event listener registered: ${eventType} (${eventListener.id})`);
  }

  /**
   * Subscribe to events with options
   */
  subscribe(eventType: string, listener: EventListenerCallback, options: SubscriptionOptions = {}): string {
    const listenerId = this.generateListenerId();
    
    const eventListener: EventListener = {
      id: listenerId,
      callback: listener,
      registeredAt: new Date(),
      callCount: 0,
      lastCalled: null,
      errorCount: 0,
      options: {
        maxRetries: options.maxRetries || 3,
        retryDelay: options.retryDelay || 1000,
        timeout: options.timeout || 30000,
        priority: options.priority || 'normal',
        filter: options.filter
      }
    };

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType)!.push(eventListener);

    console.log(`📧 Event subscription created: ${eventType} (${listenerId})`);
    return listenerId;
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(eventType: string, listenerId: string): boolean {
    const listeners = this.listeners.get(eventType);
    if (!listeners) return false;

    const index = listeners.findIndex(l => l.id === listenerId);
    if (index === -1) return false;

    listeners.splice(index, 1);
    
    if (listeners.length === 0) {
      this.listeners.delete(eventType);
    }

    console.log(`🔇 Event subscription removed: ${eventType} (${listenerId})`);
    return true;
  }

  /**
   * Emit events to all subscribers
   */
  async emit(eventType: string, data: any, options: EmitOptions = {}): Promise<void> {
    if (!this.isInitialized && eventType !== 'eventbus.initialized') {
      console.warn(`⚠️  Event Bus not initialized, queueing event: ${eventType}`);
      // Could queue events here for later processing
      return;
    }

    const event: BusEvent = {
      id: this.generateEventId(),
      type: eventType,
      data,
      timestamp: new Date(),
      source: options.source || 'system',
      priority: options.priority || 'normal',
      retryable: options.retryable !== false,
      tags: options.tags || []
    };

    // Store event in history
    this.storeEvent(event);

    // Update event statistics
    this.updateEventStats(eventType);

    console.log(`📤 Emitting event: ${eventType} (${event.id})`);

    // Get listeners for this event type
    const listeners = this.listeners.get(eventType) || [];
    
    if (listeners.length === 0) {
      console.log(`📭 No listeners for event: ${eventType}`);
      return;
    }

    // Process listeners by priority
    const prioritizedListeners = this.prioritizeListeners(listeners);
    
    const promises = prioritizedListeners.map(listener => 
      this.executeListener(event, listener)
    );

    // Wait for all listeners to complete (or fail)
    const results = await Promise.allSettled(promises);
    
    // Handle failures
    const failures = results
      .map((result, index) => ({ result, listener: prioritizedListeners[index] }))
      .filter(({ result }) => result.status === 'rejected');

    if (failures.length > 0) {
      console.error(`❌ ${failures.length} listeners failed for event ${eventType}`);
      
      // Queue failed events for retry if retryable
      for (const { listener } of failures) {
        if (event.retryable && listener.options?.maxRetries) {
          await this.queueForRetry(event, listener);
        }
      }
    }
  }

  /**
   * Emit event and wait for all listeners to complete
   */
  async emitAndWait(eventType: string, data: any, timeout: number = 30000): Promise<EventResult[]> {
    const event: BusEvent = {
      id: this.generateEventId(),
      type: eventType,
      data,
      timestamp: new Date(),
      source: 'system',
      priority: 'high',
      retryable: false,
      tags: []
    };

    this.storeEvent(event);
    this.updateEventStats(eventType);

    const listeners = this.listeners.get(eventType) || [];
    if (listeners.length === 0) return [];

    const results: EventResult[] = [];
    
    for (const listener of listeners) {
      try {
        const startTime = Date.now();
        
        // Execute with timeout
        const result = await Promise.race([
          this.executeListener(event, listener),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Listener timeout')), timeout)
          )
        ]);

        const executionTime = Date.now() - startTime;
        
        results.push({
          listenerId: listener.id,
          success: true,
          executionTime,
          result
        });

      } catch (error) {
        results.push({
          listenerId: listener.id,
          success: false,
          error: error.message,
          executionTime: timeout
        });
      }
    }

    return results;
  }

  /**
   * Get event history
   */
  getEventHistory(eventType?: string, limit: number = 100): StoredEvent[] {
    if (eventType) {
      const history = this.eventHistory.get(eventType) || [];
      return history.slice(-limit);
    }

    // Get recent events from all types
    const allEvents: StoredEvent[] = [];
    for (const events of this.eventHistory.values()) {
      allEvents.push(...events);
    }

    return allEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get event statistics
   */
  getEventStats(eventType?: string): EventStats | Map<string, EventStats> {
    if (eventType) {
      return this.eventStats.get(eventType) || {
        eventType,
        totalCount: 0,
        successCount: 0,
        failureCount: 0,
        lastEmitted: null,
        avgExecutionTime: 0,
        listenerCount: this.listeners.get(eventType)?.length || 0
      };
    }

    return new Map(this.eventStats);
  }

  /**
   * Get active listeners
   */
  getListeners(eventType?: string): Map<string, EventListener[]> | EventListener[] {
    if (eventType) {
      return this.listeners.get(eventType) || [];
    }
    return new Map(this.listeners);
  }

  /**
   * Health check for event bus
   */
  async healthCheck(): Promise<HealthStatus> {
    const totalListeners = Array.from(this.listeners.values())
      .reduce((sum, listeners) => sum + listeners.length, 0);
    
    const totalEvents = Array.from(this.eventStats.values())
      .reduce((sum, stats) => sum + stats.totalCount, 0);
    
    const failureRate = Array.from(this.eventStats.values())
      .reduce((sum, stats) => {
        const rate = stats.totalCount > 0 ? stats.failureCount / stats.totalCount : 0;
        return sum + rate;
      }, 0) / this.eventStats.size || 0;

    const isHealthy = failureRate < 0.1 && this.isInitialized;

    return {
      healthy: isHealthy,
      initialized: this.isInitialized,
      totalListeners,
      totalEvents,
      failureRate,
      retryQueueSize: this.retryQueue.size,
      lastHealthCheck: new Date()
    };
  }

  // Private methods
  private async executeListener(event: BusEvent, listener: EventListener): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Apply filter if configured
      if (listener.options?.filter && !listener.options.filter(event)) {
        return null; // Skip this listener
      }

      // Update listener stats
      listener.callCount++;
      listener.lastCalled = new Date();

      // Execute the listener callback
      const result = await listener.callback(event.data, event);
      
      const executionTime = Date.now() - startTime;
      
      // Update success stats
      this.updateListenerStats(event.type, listener.id, true, executionTime);
      
      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      // Update error stats
      listener.errorCount++;
      this.updateListenerStats(event.type, listener.id, false, executionTime);
      
      console.error(`❌ Event listener failed: ${event.type} (${listener.id})`, error);
      
      throw error;
    }
  }

  private async queueForRetry(event: BusEvent, listener: EventListener): Promise<void> {
    const retryKey = `${event.id}_${listener.id}`;
    
    const retryableEvent: RetryableEvent = {
      event,
      listener,
      attempts: 0,
      maxRetries: listener.options?.maxRetries || 3,
      retryDelay: listener.options?.retryDelay || 1000,
      nextRetry: new Date(Date.now() + (listener.options?.retryDelay || 1000))
    };

    this.retryQueue.set(retryKey, retryableEvent);
    
    console.log(`🔄 Event queued for retry: ${event.type} (${retryKey})`);
  }

  private prioritizeListeners(listeners: EventListener[]): EventListener[] {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    
    return [...listeners].sort((a, b) => {
      const aPriority = priorityOrder[a.options?.priority || 'normal'];
      const bPriority = priorityOrder[b.options?.priority || 'normal'];
      return bPriority - aPriority;
    });
  }

  private storeEvent(event: BusEvent): void {
    if (!this.eventHistory.has(event.type)) {
      this.eventHistory.set(event.type, []);
    }

    const history = this.eventHistory.get(event.type)!;
    history.push({
      ...event,
      storedAt: new Date()
    });

    // Limit history size
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize);
    }
  }

  private updateEventStats(eventType: string): void {
    if (!this.eventStats.has(eventType)) {
      this.eventStats.set(eventType, {
        eventType,
        totalCount: 0,
        successCount: 0,
        failureCount: 0,
        lastEmitted: null,
        avgExecutionTime: 0,
        listenerCount: 0
      });
    }

    const stats = this.eventStats.get(eventType)!;
    stats.totalCount++;
    stats.lastEmitted = new Date();
    stats.listenerCount = this.listeners.get(eventType)?.length || 0;
  }

  private updateListenerStats(
    eventType: string,
    listenerId: string,
    success: boolean,
    executionTime: number
  ): void {
    const stats = this.eventStats.get(eventType);
    if (!stats) return;

    if (success) {
      stats.successCount++;
    } else {
      stats.failureCount++;
    }

    // Update average execution time
    const totalSuccessful = stats.successCount;
    if (totalSuccessful > 0) {
      stats.avgExecutionTime = 
        ((stats.avgExecutionTime * (totalSuccessful - 1)) + executionTime) / totalSuccessful;
    }
  }

  private startRetryProcessor(): void {
    setInterval(async () => {
      await this.processRetryQueue();
    }, 5000); // Process retries every 5 seconds

    console.log('🔄 Event retry processor started');
  }

  private async processRetryQueue(): Promise<void> {
    const now = new Date();
    const retryableEvents = Array.from(this.retryQueue.values())
      .filter(retry => retry.nextRetry <= now);

    for (const retryEvent of retryableEvents) {
      const retryKey = `${retryEvent.event.id}_${retryEvent.listener.id}`;
      
      try {
        retryEvent.attempts++;
        
        console.log(`🔄 Retrying event: ${retryEvent.event.type} (attempt ${retryEvent.attempts})`);
        
        await this.executeListener(retryEvent.event, retryEvent.listener);
        
        // Success - remove from retry queue
        this.retryQueue.delete(retryKey);
        
        console.log(`✅ Event retry successful: ${retryEvent.event.type}`);
        
      } catch (error) {
        if (retryEvent.attempts >= retryEvent.maxRetries) {
          // Max retries exceeded - remove from queue
          this.retryQueue.delete(retryKey);
          
          console.error(`❌ Event retry failed permanently: ${retryEvent.event.type}`, error);
          
          // Emit retry failed event
          this.emit('eventbus.retry_failed', {
            originalEvent: retryEvent.event,
            listenerId: retryEvent.listener.id,
            attempts: retryEvent.attempts,
            finalError: error.message
          });
          
        } else {
          // Schedule next retry with exponential backoff
          const backoffDelay = retryEvent.retryDelay * Math.pow(2, retryEvent.attempts - 1);
          retryEvent.nextRetry = new Date(now.getTime() + backoffDelay);
          
          console.log(`🔄 Event retry scheduled: ${retryEvent.event.type} (next attempt in ${backoffDelay}ms)`);
        }
      }
    }
  }

  private startEventCleanup(): void {
    // Clean up old events every hour
    setInterval(() => {
      this.cleanupOldEvents();
    }, 60 * 60 * 1000);

    console.log('🧹 Event cleanup processor started');
  }

  private cleanupOldEvents(): void {
    const cutoffTime = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 hours ago
    let totalCleaned = 0;

    for (const [eventType, events] of this.eventHistory) {
      const initialLength = events.length;
      const filteredEvents = events.filter(event => event.timestamp > cutoffTime);
      
      if (filteredEvents.length !== initialLength) {
        this.eventHistory.set(eventType, filteredEvents);
        totalCleaned += (initialLength - filteredEvents.length);
      }
    }

    if (totalCleaned > 0) {
      console.log(`🧹 Cleaned up ${totalCleaned} old events`);
    }
  }

  private setupInternalEvents(): void {
    // Setup internal event handlers for monitoring and diagnostics
    
    // Monitor system health
    this.on('eventbus.health_check', (data) => {
      console.log('💓 Event Bus health check requested');
    });

    // Monitor retry failures
    this.on('eventbus.retry_failed', (data) => {
      console.error('🚨 Event retry failed permanently:', data);
    });

    // Monitor high error rates
    this.on('eventbus.high_error_rate', (data) => {
      console.warn('⚠️  High error rate detected:', data);
    });
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateListenerId(): string {
    return `lst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown the event bus gracefully
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Event Bus...');
    
    this.isInitialized = false;
    
    // Wait for pending retry operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear all listeners and data
    this.listeners.clear();
    this.retryQueue.clear();
    
    console.log('✅ Event Bus shutdown complete');
  }
}

// Supporting interfaces and types
export type EventListenerCallback = (data: any, event?: BusEvent) => Promise<any> | any;

export interface BusEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  source: string;
  priority: 'low' | 'normal' | 'high';
  retryable: boolean;
  tags: string[];
}

export interface StoredEvent extends BusEvent {
  storedAt: Date;
}

export interface EventListener {
  id: string;
  callback: EventListenerCallback;
  registeredAt: Date;
  callCount: number;
  lastCalled: Date | null;
  errorCount: number;
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
    priority?: 'low' | 'normal' | 'high';
    filter?: (event: BusEvent) => boolean;
  };
}

export interface SubscriptionOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  priority?: 'low' | 'normal' | 'high';
  filter?: (event: BusEvent) => boolean;
}

export interface EmitOptions {
  source?: string;
  priority?: 'low' | 'normal' | 'high';
  retryable?: boolean;
  tags?: string[];
}

export interface EventStats {
  eventType: string;
  totalCount: number;
  successCount: number;
  failureCount: number;
  lastEmitted: Date | null;
  avgExecutionTime: number;
  listenerCount: number;
}

export interface EventResult {
  listenerId: string;
  success: boolean;
  executionTime: number;
  result?: any;
  error?: string;
}

export interface RetryableEvent {
  event: BusEvent;
  listener: EventListener;
  attempts: number;
  maxRetries: number;
  retryDelay: number;
  nextRetry: Date;
}

export interface HealthStatus {
  healthy: boolean;
  initialized: boolean;
  totalListeners: number;
  totalEvents: number;
  failureRate: number;
  retryQueueSize: number;
  lastHealthCheck: Date;
}

// Pre-defined event types for type safety
export const EventTypes = {
  // System events
  SYSTEM_STARTUP: 'system.startup',
  SYSTEM_SHUTDOWN: 'system.shutdown',
  SYSTEM_HEALTH_CHECK: 'system.health_check',
  
  // Orchestrator events
  ORCHESTRATOR_INITIALIZED: 'orchestrator.initialized',
  QUERY_PROCESSED: 'orchestrator.query_processed',
  ROUTING_DECISION_MADE: 'orchestrator.routing_decision_made',
  
  // Safety events
  SAFETY_VIOLATION_DETECTED: 'safety.violation_detected',
  CRISIS_DETECTED: 'safety.crisis_detected',
  EMERGENCY_INTERVENTION: 'safety.emergency_intervention',
  HUMAN_REVIEW_REQUIRED: 'safety.human_review_required',
  
  // Model events
  MODEL_REGISTERED: 'model.registered',
  MODEL_DEPLOYED: 'model.deployed',
  MODEL_PERFORMANCE_DEGRADED: 'model.performance_degraded',
  MODEL_HEALTH_CHECK: 'model.health_check',
  
  // Training events
  TRAINING_JOB_STARTED: 'mlops.training_started',
  TRAINING_JOB_COMPLETED: 'mlops.training_completed',
  TRAINING_JOB_FAILED: 'mlops.training_failed',
  MODEL_EVALUATION_COMPLETED: 'mlops.evaluation_completed',
  
  // User events
  USER_FEEDBACK_RECEIVED: 'user.feedback_received',
  USER_INTERACTION_LOGGED: 'user.interaction_logged',
  USER_PATTERN_DETECTED: 'user.pattern_detected',
  
  // Vector database events
  VECTOR_STORED: 'vector.stored',
  SEMANTIC_SEARCH_PERFORMED: 'vector.search_performed',
  
  // Feature store events
  FEATURES_UPDATED: 'features.updated',
  FEATURE_COMPUTATION_COMPLETED: 'features.computation_completed'
} as const;