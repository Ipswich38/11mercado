import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { Orchestrator } from '../orchestrator/Orchestrator';
import { QueryContext, UserProfile } from '../orchestrator/types';
import { v4 as uuidv4 } from 'uuid';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
}

/**
 * API Gateway - Entry point for all AI Orchestrator requests
 * Handles authentication, rate limiting, validation, and routing
 */
export class APIGateway {
  private app: express.Application;
  private orchestrator: Orchestrator;
  private jwtSecret: string;

  constructor(orchestrator: Orchestrator) {
    this.app = express();
    this.orchestrator = orchestrator;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID']
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting - different limits for different endpoints
    const createRateLimiter = (windowMs: number, max: number, message: string) =>
      rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
      });

    // General API rate limit
    this.app.use('/api/', createRateLimiter(15 * 60 * 1000, 100, 'Too many requests'));

    // Stricter limit for AI query endpoint
    this.app.use('/api/v1/query', createRateLimiter(60 * 1000, 10, 'Too many AI queries'));

    // Very strict limit for sensitive endpoints
    this.app.use('/api/v1/crisis', createRateLimiter(60 * 1000, 5, 'Crisis endpoint rate limit'));

    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || '1.0.0'
      });
    });

    // API Routes
    this.app.use('/api/v1', this.createAPIRouter());

    // Error handling middleware
    this.app.use(this.errorHandler);

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }

  private createAPIRouter(): express.Router {
    const router = express.Router();

    // Authentication endpoint
    router.post('/auth/login',
      [
        body('userId').isString().isLength({ min: 1 }),
        body('sessionId').isString().isLength({ min: 1 }),
        body('consentToTrain').isBoolean().optional()
      ],
      this.handleLogin.bind(this)
    );

    // Main query endpoint - the heart of the system
    router.post('/query',
      this.authenticateToken,
      [
        body('query').isString().isLength({ min: 1, max: 2000 }),
        body('sessionId').isString().isLength({ min: 1 }),
        body('context').isObject().optional()
      ],
      this.handleQuery.bind(this)
    );

    // Async query endpoint for long-running requests
    router.post('/query/async',
      this.authenticateToken,
      [
        body('query').isString().isLength({ min: 1, max: 2000 }),
        body('sessionId').isString().isLength({ min: 1 }),
        body('webhookUrl').isURL().optional()
      ],
      this.handleAsyncQuery.bind(this)
    );

    // Query result endpoint for polling
    router.get('/query/:requestId',
      this.authenticateToken,
      this.handleQueryResult.bind(this)
    );

    // Feedback endpoint
    router.post('/feedback',
      this.authenticateToken,
      [
        body('eventId').isString(),
        body('rating').isInt({ min: 1, max: 5 }),
        body('helpful').isBoolean(),
        body('categories').isArray().optional(),
        body('comment').isString().optional()
      ],
      this.handleFeedback.bind(this)
    );

    // Crisis intervention endpoint
    router.post('/crisis',
      this.authenticateToken,
      [
        body('eventId').isString(),
        body('level').isIn(['watch', 'intervention', 'emergency']),
        body('indicators').isArray()
      ],
      this.handleCrisisReport.bind(this)
    );

    // User profile management
    router.get('/profile', this.authenticateToken, this.handleGetProfile.bind(this));
    router.put('/profile',
      this.authenticateToken,
      [
        body('consentToTrain').isBoolean().optional(),
        body('preferences').isObject().optional()
      ],
      this.handleUpdateProfile.bind(this)
    );

    // Admin endpoints (require admin role)
    router.get('/admin/stats', 
      this.authenticateToken, 
      this.requireRole(['admin']), 
      this.handleAdminStats.bind(this)
    );

    router.get('/admin/events',
      this.authenticateToken,
      this.requireRole(['admin', 'moderator']),
      this.handleAdminEvents.bind(this)
    );

    return router;
  }

  // Authentication middleware
  private authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    jwt.verify(token, this.jwtSecret, (err: any, user: any) => {
      if (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
      }

      req.user = user;
      next();
    });
  };

  // Role-based authorization middleware
  private requireRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      next();
    };
  };

  // Route handlers
  private async handleLogin(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { userId, sessionId, consentToTrain = false } = req.body;

      // Create JWT token
      const token = jwt.sign(
        { 
          id: userId, 
          sessionId,
          role: 'user',
          permissions: ['query', 'feedback']
        },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      // Log successful authentication
      console.log(`🔐 User authenticated: ${userId}`);

      res.json({
        token,
        expiresIn: '24h',
        user: {
          id: userId,
          sessionId,
          consentToTrain
        }
      });
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  private async handleQuery(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { query, sessionId, context = {} } = req.body;
      const userId = req.user!.id;

      // Build query context
      const queryContext: QueryContext = {
        userId,
        sessionId,
        query,
        timestamp: new Date(),
        userProfile: await this.getUserProfile(userId),
        conversationHistory: context.conversationHistory || [],
        realTimeContext: {
          timeOfDay: new Date().toLocaleTimeString(),
          dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }),
          isExamPeriod: context.isExamPeriod || false,
          userLocation: context.userLocation
        }
      };

      // Process through orchestrator
      const startTime = Date.now();
      const result = await this.orchestrator.processQuery(queryContext);
      const processingTime = Date.now() - startTime;

      // Response with metadata
      res.json({
        requestId: result.eventId,
        response: result.response,
        metadata: {
          modelUsed: result.routingDecision.modelId,
          processingTimeMs: processingTime,
          confidence: result.routingDecision.confidence,
          safetyScore: 1 - (result.safetyFlags.selfHarm || result.safetyFlags.suicidalLanguage ? 0.5 : 0),
          timestamp: new Date().toISOString()
        },
        followUp: this.generateFollowUpSuggestions(query, result.response)
      });

    } catch (error) {
      console.error('Query processing error:', error);
      res.status(500).json({ 
        error: 'Failed to process query',
        requestId: uuidv4(),
        fallbackResponse: "I'm having trouble processing your request right now. Please try again or contact support if this continues."
      });
    }
  }

  private async handleAsyncQuery(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const requestId = uuidv4();
      const { query, sessionId, webhookUrl } = req.body;
      const userId = req.user!.id;

      // Immediately return request ID
      res.json({
        requestId,
        status: 'accepted',
        estimatedCompletionTime: '30-60 seconds',
        pollUrl: `/api/v1/query/${requestId}`
      });

      // Process asynchronously
      this.processAsyncQuery(userId, sessionId, query, requestId, webhookUrl);

    } catch (error) {
      console.error('Async query error:', error);
      res.status(500).json({ error: 'Failed to queue async query' });
    }
  }

  private async handleQueryResult(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { requestId } = req.params;
    
    // In production, this would check a job queue or database
    // For now, return a mock response
    res.json({
      requestId,
      status: 'completed', // or 'processing', 'failed'
      result: {
        response: "This is a mock async response. In production, this would contain the actual AI response.",
        completedAt: new Date().toISOString()
      }
    });
  }

  private async handleFeedback(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { eventId, rating, helpful, categories, comment } = req.body;
      const userId = req.user!.id;

      // Log feedback for ML training
      console.log(`📝 Feedback received: Event ${eventId}, Rating: ${rating}, Helpful: ${helpful}`);

      // In production, this would go to the event bus for ML training
      // await this.eventBus.emit('feedback.received', { eventId, userId, rating, helpful, categories, comment });

      res.json({ success: true, message: 'Feedback recorded' });
    } catch (error) {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Failed to record feedback' });
    }
  }

  private async handleCrisisReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { eventId, level, indicators } = req.body;
      const userId = req.user!.id;

      // Immediate alert for crisis situations
      console.log(`🚨 CRISIS REPORT: User ${userId}, Level: ${level}, Event: ${eventId}`);

      // In production, this would trigger immediate human review
      // await this.eventBus.emit('crisis.reported', { eventId, userId, level, indicators, timestamp: new Date() });

      res.json({ 
        success: true, 
        message: 'Crisis report received and flagged for immediate review',
        resources: {
          emergencyHotline: '988',
          textCrisisLine: '741741',
          localEmergency: '911'
        }
      });
    } catch (error) {
      console.error('Crisis report error:', error);
      res.status(500).json({ error: 'Failed to process crisis report' });
    }
  }

  private async handleGetProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await this.getUserProfile(userId);
      
      res.json({
        profile: {
          id: profile.id,
          consentToTrain: profile.consentToTrain,
          lastInteraction: profile.lastInteraction,
          // Don't expose sensitive data like stress scores
        }
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  private async handleUpdateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { consentToTrain, preferences } = req.body;

      // In production, update user profile in database
      console.log(`👤 Profile updated for user ${userId}: consent=${consentToTrain}`);

      res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  private async handleAdminStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Mock admin statistics
      res.json({
        stats: {
          totalQueries: 15847,
          activeUsers: 234,
          averageResponseTime: 850,
          safetyIncidents: 12,
          crisisInterventions: 3,
          modelAccuracy: 0.94,
          uptime: '99.8%'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }

  private async handleAdminEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Mock recent events for admin monitoring
      res.json({
        events: [
          {
            id: 'evt_001',
            type: 'crisis.detected',
            level: 'intervention',
            userId: 'user_***',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'reviewed'
          },
          {
            id: 'evt_002', 
            type: 'feedback.received',
            rating: 5,
            userId: 'user_***',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          }
        ]
      });
    } catch (error) {
      console.error('Admin events error:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  }

  // Helper methods
  private async processAsyncQuery(
    userId: string, 
    sessionId: string, 
    query: string, 
    requestId: string, 
    webhookUrl?: string
  ): Promise<void> {
    try {
      // Build context and process through orchestrator
      const queryContext: QueryContext = {
        userId,
        sessionId,
        query,
        timestamp: new Date(),
        userProfile: await this.getUserProfile(userId),
        conversationHistory: [],
        realTimeContext: {
          timeOfDay: new Date().toLocaleTimeString(),
          dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' })
        }
      };

      const result = await this.orchestrator.processQuery(queryContext);

      // If webhook provided, send result
      if (webhookUrl) {
        // In production, send HTTP POST to webhook
        console.log(`📤 Would send result to webhook: ${webhookUrl}`);
      }

      // Store result for polling
      // In production, store in Redis or database
      console.log(`✅ Async query ${requestId} completed`);

    } catch (error) {
      console.error(`❌ Async query ${requestId} failed:`, error);
    }
  }

  private async getUserProfile(userId: string): Promise<UserProfile> {
    // Mock user profile - in production, fetch from database
    return {
      id: userId,
      anonymizedHash: `hash_${userId}`,
      consentToTrain: true,
      stressScore: 0.3,
      recentEngagement: 0.7,
      lastInteraction: new Date(),
      mentalHealthFlags: {
        riskLevel: 'low',
        lastAssessment: new Date(),
        triggerWords: []
      }
    };
  }

  private generateFollowUpSuggestions(query: string, response: string): string[] {
    const suggestions = [
      "Would you like me to explain any part in more detail?",
      "Are there specific resources you'd like me to help you find?",
      "How are you feeling about this information?"
    ];

    // Customize suggestions based on query type
    if (query.toLowerCase().includes('stress') || query.toLowerCase().includes('anxious')) {
      suggestions.push("Would you like some coping strategies for managing stress?");
      suggestions.push("Are you interested in mindfulness techniques?");
    }

    return suggestions.slice(0, 3);
  }

  // Error handling middleware
  private errorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
    console.error('API Gateway Error:', error);

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
      error: isDevelopment ? error.message : 'Internal server error',
      requestId: uuidv4(),
      timestamp: new Date().toISOString()
    });
  };

  public getApp(): express.Application {
    return this.app;
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`🌐 API Gateway listening on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🔗 API docs: http://localhost:${port}/api/v1/docs`);
    });
  }
}