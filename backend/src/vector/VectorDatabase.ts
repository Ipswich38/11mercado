import { EventBus } from '../events/EventBus';

/**
 * Vector Database - Manages embeddings, semantic search, and RAG capabilities
 * Supports conversation memory, knowledge retrieval, and contextual understanding
 */
export class VectorDatabase {
  private eventBus: EventBus;
  private embeddings: Map<string, VectorEntry> = new Map();
  private collections: Map<string, VectorCollection> = new Map();
  private indexer: VectorIndexer;
  private embeddingModel: EmbeddingModel;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.indexer = new VectorIndexer();
    this.embeddingModel = new EmbeddingModel();
  }

  async initialize(): Promise<void> {
    console.log('🗃️  Initializing Vector Database...');
    
    // Initialize embedding model
    await this.embeddingModel.initialize();
    
    // Create default collections
    await this.createDefaultCollections();
    
    // Build search indices
    await this.indexer.buildIndices(this.collections);
    
    console.log('✅ Vector Database initialized with', this.collections.size, 'collections');
  }

  /**
   * Store conversation memory as embeddings
   */
  async storeConversation(
    userId: string, 
    sessionId: string, 
    messages: ConversationMessage[]
  ): Promise<void> {
    try {
      const collectionName = 'conversation_memory';
      
      for (const message of messages) {
        // Generate embedding for the message
        const embedding = await this.embeddingModel.embed(message.content);
        
        // Create vector entry
        const vectorEntry: VectorEntry = {
          id: `conv_${sessionId}_${message.id}`,
          vector: embedding,
          metadata: {
            userId,
            sessionId,
            messageId: message.id,
            role: message.role,
            timestamp: message.timestamp,
            content: message.content,
            type: 'conversation',
            // Privacy: anonymize if needed
            anonymized: this.anonymizeContent(message.content),
            sentiment: await this.analyzeSentiment(message.content),
            topics: await this.extractTopics(message.content)
          },
          createdAt: new Date()
        };

        // Store in collection
        await this.addToCollection(collectionName, vectorEntry);
      }

      console.log(`💬 Stored ${messages.length} conversation messages for session ${sessionId}`);
      
      // Emit storage event
      this.eventBus.emit('vector.conversation_stored', {
        userId,
        sessionId,
        messageCount: messages.length,
        timestamp: new Date()
      });

    } catch (error) {
      console.error(`❌ Failed to store conversation for session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Store knowledge base articles and educational content
   */
  async storeKnowledge(articles: KnowledgeArticle[]): Promise<void> {
    try {
      const collectionName = 'knowledge_base';
      
      for (const article of articles) {
        // Chunk long articles for better retrieval
        const chunks = this.chunkContent(article.content, 500);
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const embedding = await this.embeddingModel.embed(chunk);
          
          const vectorEntry: VectorEntry = {
            id: `kb_${article.id}_chunk_${i}`,
            vector: embedding,
            metadata: {
              articleId: article.id,
              title: article.title,
              category: article.category,
              author: article.author,
              chunkIndex: i,
              totalChunks: chunks.length,
              content: chunk,
              fullContent: article.content,
              type: 'knowledge',
              tags: article.tags || [],
              difficulty: article.difficulty || 'intermediate',
              lastUpdated: article.lastUpdated
            },
            createdAt: new Date()
          };

          await this.addToCollection(collectionName, vectorEntry);
        }
      }

      console.log(`📚 Stored ${articles.length} knowledge articles`);
      
      this.eventBus.emit('vector.knowledge_stored', {
        articleCount: articles.length,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Failed to store knowledge articles:', error);
      throw error;
    }
  }

  /**
   * Semantic search for relevant content
   */
  async semanticSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      const {
        collections = ['conversation_memory', 'knowledge_base'],
        limit = 10,
        threshold = 0.7,
        filters = {}
      } = options;

      // Generate query embedding
      const queryEmbedding = await this.embeddingModel.embed(query);
      
      // Search across collections
      const results: SearchResult[] = [];
      
      for (const collectionName of collections) {
        const collection = this.collections.get(collectionName);
        if (!collection) continue;
        
        const collectionResults = await this.searchCollection(
          collection,
          queryEmbedding,
          { ...options, limit: Math.ceil(limit / collections.length) }
        );
        
        results.push(...collectionResults);
      }

      // Sort by similarity score and apply final limit
      const sortedResults = results
        .filter(r => r.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      console.log(`🔍 Semantic search returned ${sortedResults.length} results for: "${query.substring(0, 50)}..."`);
      
      return sortedResults;

    } catch (error) {
      console.error('❌ Semantic search failed:', error);
      return [];
    }
  }

  /**
   * Get conversation context for a user
   */
  async getConversationContext(
    userId: string, 
    sessionId?: string,
    limit: number = 10
  ): Promise<ConversationContext> {
    try {
      const filters: Record<string, any> = { userId };
      if (sessionId) filters.sessionId = sessionId;
      
      const results = await this.semanticSearch('', {
        collections: ['conversation_memory'],
        limit,
        filters,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      });

      const messages = results.map(result => ({
        id: result.metadata.messageId,
        role: result.metadata.role,
        content: result.metadata.content,
        timestamp: result.metadata.timestamp,
        sentiment: result.metadata.sentiment
      }));

      const context: ConversationContext = {
        userId,
        sessionId,
        messages,
        summary: await this.summarizeConversation(messages),
        topics: this.extractConversationTopics(results),
        sentiment: this.calculateAverageSentiment(results),
        retrievedAt: new Date()
      };

      return context;

    } catch (error) {
      console.error(`❌ Failed to get conversation context for user ${userId}:`, error);
      return {
        userId,
        sessionId,
        messages: [],
        summary: '',
        topics: [],
        sentiment: 0.5,
        retrievedAt: new Date()
      };
    }
  }

  /**
   * RAG (Retrieval Augmented Generation) - Get relevant context for AI responses
   */
  async getRAGContext(
    query: string,
    userContext: UserRAGContext
  ): Promise<RAGContext> {
    try {
      // Multi-stage retrieval for comprehensive context
      
      // 1. Get relevant knowledge base articles
      const knowledgeResults = await this.semanticSearch(query, {
        collections: ['knowledge_base'],
        limit: 5,
        threshold: 0.6
      });

      // 2. Get relevant conversation history
      const conversationResults = await this.semanticSearch(query, {
        collections: ['conversation_memory'],
        limit: 3,
        threshold: 0.5,
        filters: { userId: userContext.userId }
      });

      // 3. Get user-specific patterns
      const userPatterns = await this.getUserPatterns(userContext.userId);

      // 4. Combine and rank all context
      const combinedContext = this.combineRAGContext(
        knowledgeResults,
        conversationResults,
        userPatterns,
        query
      );

      const ragContext: RAGContext = {
        query,
        userId: userContext.userId,
        retrievedDocuments: combinedContext.documents,
        conversationHistory: combinedContext.conversation,
        userPatterns: combinedContext.patterns,
        contextSummary: combinedContext.summary,
        confidence: combinedContext.confidence,
        sources: combinedContext.sources,
        retrievedAt: new Date()
      };

      console.log(`🧠 RAG context retrieved with ${ragContext.retrievedDocuments.length} documents`);
      
      return ragContext;

    } catch (error) {
      console.error('❌ Failed to get RAG context:', error);
      return {
        query,
        userId: userContext.userId,
        retrievedDocuments: [],
        conversationHistory: [],
        userPatterns: {},
        contextSummary: '',
        confidence: 0,
        sources: [],
        retrievedAt: new Date()
      };
    }
  }

  /**
   * Store user interaction patterns for personalization
   */
  async storeUserPattern(
    userId: string,
    pattern: UserPattern
  ): Promise<void> {
    try {
      const collectionName = 'user_patterns';
      
      // Create embedding for the pattern
      const patternText = `${pattern.type}: ${pattern.description} [${pattern.context.join(', ')}]`;
      const embedding = await this.embeddingModel.embed(patternText);
      
      const vectorEntry: VectorEntry = {
        id: `pattern_${userId}_${pattern.type}_${Date.now()}`,
        vector: embedding,
        metadata: {
          userId,
          patternType: pattern.type,
          description: pattern.description,
          context: pattern.context,
          frequency: pattern.frequency,
          confidence: pattern.confidence,
          lastObserved: pattern.lastObserved,
          type: 'user_pattern'
        },
        createdAt: new Date()
      };

      await this.addToCollection(collectionName, vectorEntry);
      
      console.log(`👤 Stored user pattern: ${pattern.type} for user ${userId}`);

    } catch (error) {
      console.error(`❌ Failed to store user pattern for ${userId}:`, error);
    }
  }

  /**
   * Clean up old vectors based on retention policy
   */
  async cleanupOldVectors(retentionDays: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      let totalDeleted = 0;
      
      for (const [collectionName, collection] of this.collections) {
        const deleted = await this.deleteOldVectors(collection, cutoffDate);
        totalDeleted += deleted;
      }

      // Rebuild indices after cleanup
      await this.indexer.rebuildIndices(this.collections);
      
      console.log(`🧹 Cleaned up ${totalDeleted} old vectors (older than ${retentionDays} days)`);
      
      this.eventBus.emit('vector.cleanup_completed', {
        deletedCount: totalDeleted,
        retentionDays,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Vector cleanup failed:', error);
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<VectorDatabaseStats> {
    const stats: VectorDatabaseStats = {
      totalVectors: 0,
      totalCollections: this.collections.size,
      collections: {},
      indexSize: 0,
      memoryUsageMB: 0,
      lastUpdated: new Date()
    };

    for (const [name, collection] of this.collections) {
      const collectionStats = {
        vectorCount: collection.vectors.size,
        avgVectorSize: this.calculateAverageVectorSize(collection),
        lastUpdated: collection.lastUpdated
      };
      
      stats.collections[name] = collectionStats;
      stats.totalVectors += collectionStats.vectorCount;
    }

    // Estimate memory usage (rough calculation)
    stats.memoryUsageMB = Math.round((stats.totalVectors * 384 * 4) / (1024 * 1024)); // 384-dim vectors, 4 bytes per float
    stats.indexSize = await this.indexer.getIndexSize();

    return stats;
  }

  // Private methods
  private async createDefaultCollections(): Promise<void> {
    // Conversation memory collection
    await this.createCollection('conversation_memory', {
      description: 'User conversation history and context',
      vectorDimension: 384, // Using sentence-transformers/all-MiniLM-L6-v2
      indexType: 'hnsw',
      retentionDays: 90
    });

    // Knowledge base collection
    await this.createCollection('knowledge_base', {
      description: 'Educational content and knowledge articles',
      vectorDimension: 384,
      indexType: 'hnsw',
      retentionDays: 365 // Keep knowledge longer
    });

    // User patterns collection
    await this.createCollection('user_patterns', {
      description: 'User behavior patterns and preferences',
      vectorDimension: 384,
      indexType: 'hnsw',
      retentionDays: 180
    });

    // Mental health resources collection
    await this.createCollection('mental_health_resources', {
      description: 'Mental health support content and resources',
      vectorDimension: 384,
      indexType: 'hnsw',
      retentionDays: 365
    });

    console.log('✅ Default vector collections created');
  }

  private async createCollection(name: string, config: CollectionConfig): Promise<void> {
    const collection: VectorCollection = {
      name,
      config,
      vectors: new Map(),
      index: null,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.collections.set(name, collection);
    console.log(`📁 Created vector collection: ${name}`);
  }

  private async addToCollection(collectionName: string, entry: VectorEntry): Promise<void> {
    const collection = this.collections.get(collectionName);
    if (!collection) {
      throw new Error(`Collection ${collectionName} not found`);
    }

    collection.vectors.set(entry.id, entry);
    collection.lastUpdated = new Date();

    // Update index
    await this.indexer.addToIndex(collection, entry);
  }

  private async searchCollection(
    collection: VectorCollection,
    queryVector: number[],
    options: SearchOptions
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    // Use index for efficient search if available
    if (collection.index) {
      return await this.indexer.search(collection, queryVector, options);
    }
    
    // Fallback to brute force search
    for (const [id, entry] of collection.vectors) {
      // Apply filters
      if (options.filters && !this.matchesFilters(entry.metadata, options.filters)) {
        continue;
      }

      const similarity = this.cosineSimilarity(queryVector, entry.vector);
      
      if (similarity >= (options.threshold || 0.5)) {
        results.push({
          id,
          similarity,
          metadata: entry.metadata,
          content: entry.metadata.content || '',
          source: collection.name
        });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, options.limit || 10);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private matchesFilters(metadata: Record<string, any>, filters: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(filters)) {
      if (metadata[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private chunkContent(content: string, maxChunkSize: number): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence.trim();
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence.trim();
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private anonymizeContent(content: string): string {
    // Remove personal information for privacy
    return content
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}-?\d{3}-?\d{4}\b/g, '[PHONE]')
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]');
  }

  private async analyzeSentiment(content: string): Promise<number> {
    // Mock sentiment analysis - in production, use actual NLP model
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'horrible', 'depressed'];
    
    const words = content.toLowerCase().split(/\s+/);
    let sentiment = 0.5; // Neutral
    
    positiveWords.forEach(word => {
      if (words.includes(word)) sentiment += 0.1;
    });
    
    negativeWords.forEach(word => {
      if (words.includes(word)) sentiment -= 0.1;
    });
    
    return Math.max(0, Math.min(1, sentiment));
  }

  private async extractTopics(content: string): Promise<string[]> {
    // Mock topic extraction - in production, use NLP models
    const topics = [
      'education', 'mental_health', 'stress', 'anxiety', 'depression',
      'relationships', 'career', 'study', 'exam', 'homework'
    ];
    
    const lowerContent = content.toLowerCase();
    return topics.filter(topic => lowerContent.includes(topic));
  }

  private async summarizeConversation(messages: ConversationMessage[]): Promise<string> {
    if (messages.length === 0) return '';
    
    // Simple extractive summarization - in production, use proper summarization models
    const importantMessages = messages
      .filter(m => m.content.length > 50)
      .slice(0, 3)
      .map(m => m.content.substring(0, 100) + '...');
    
    return importantMessages.join(' ');
  }

  private extractConversationTopics(results: SearchResult[]): string[] {
    const allTopics = results.flatMap(r => r.metadata.topics || []);
    const topicCounts = new Map<string, number>();
    
    allTopics.forEach(topic => {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });
    
    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);
  }

  private calculateAverageSentiment(results: SearchResult[]): number {
    if (results.length === 0) return 0.5;
    
    const sentiments = results
      .map(r => r.metadata.sentiment)
      .filter(s => typeof s === 'number');
    
    if (sentiments.length === 0) return 0.5;
    
    return sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
  }

  private async getUserPatterns(userId: string): Promise<Record<string, any>> {
    try {
      const patternResults = await this.semanticSearch('', {
        collections: ['user_patterns'],
        limit: 10,
        filters: { userId },
        sortBy: 'frequency',
        sortOrder: 'desc'
      });

      const patterns: Record<string, any> = {};
      
      patternResults.forEach(result => {
        const patternType = result.metadata.patternType;
        patterns[patternType] = {
          description: result.metadata.description,
          context: result.metadata.context,
          frequency: result.metadata.frequency,
          confidence: result.metadata.confidence
        };
      });

      return patterns;
    } catch (error) {
      console.error(`❌ Failed to get user patterns for ${userId}:`, error);
      return {};
    }
  }

  private combineRAGContext(
    knowledgeResults: SearchResult[],
    conversationResults: SearchResult[],
    userPatterns: Record<string, any>,
    query: string
  ): CombinedRAGContext {
    const documents = knowledgeResults.map(r => ({
      id: r.id,
      content: r.content,
      title: r.metadata.title || 'Knowledge Article',
      source: r.metadata.category || 'knowledge_base',
      relevanceScore: r.similarity
    }));

    const conversation = conversationResults.map(r => ({
      role: r.metadata.role,
      content: r.content,
      timestamp: r.metadata.timestamp,
      relevanceScore: r.similarity
    }));

    const allResults = [...knowledgeResults, ...conversationResults];
    const avgConfidence = allResults.length > 0 ? 
      allResults.reduce((sum, r) => sum + r.similarity, 0) / allResults.length : 0;

    const sources = Array.from(new Set(allResults.map(r => r.source)));

    // Generate context summary
    const summary = this.generateContextSummary(documents, conversation, userPatterns, query);

    return {
      documents,
      conversation,
      patterns: userPatterns,
      summary,
      confidence: avgConfidence,
      sources
    };
  }

  private generateContextSummary(
    documents: any[],
    conversation: any[],
    patterns: Record<string, any>,
    query: string
  ): string {
    const parts = [];
    
    if (documents.length > 0) {
      parts.push(`Found ${documents.length} relevant knowledge articles`);
    }
    
    if (conversation.length > 0) {
      parts.push(`Retrieved ${conversation.length} related conversation messages`);
    }
    
    const patternCount = Object.keys(patterns).length;
    if (patternCount > 0) {
      parts.push(`Identified ${patternCount} user behavior patterns`);
    }
    
    return parts.join(', ') + ` for query: "${query.substring(0, 50)}..."`;
  }

  private async deleteOldVectors(collection: VectorCollection, cutoffDate: Date): Promise<number> {
    let deletedCount = 0;
    
    for (const [id, entry] of collection.vectors) {
      if (entry.createdAt < cutoffDate) {
        collection.vectors.delete(id);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      collection.lastUpdated = new Date();
    }
    
    return deletedCount;
  }

  private calculateAverageVectorSize(collection: VectorCollection): number {
    if (collection.vectors.size === 0) return 0;
    
    const firstVector = Array.from(collection.vectors.values())[0];
    return firstVector?.vector.length || 0;
  }
}

// Supporting classes
class EmbeddingModel {
  async initialize(): Promise<void> {
    console.log('🤖 Initializing embedding model...');
    // In production, load actual embedding model (e.g., sentence-transformers)
  }

  async embed(text: string): Promise<number[]> {
    // Mock embedding - in production, use actual model
    // Using 384 dimensions to match sentence-transformers/all-MiniLM-L6-v2
    return new Array(384).fill(0).map(() => Math.random() * 2 - 1);
  }
}

class VectorIndexer {
  async buildIndices(collections: Map<string, VectorCollection>): Promise<void> {
    for (const [name, collection] of collections) {
      if (collection.config.indexType === 'hnsw') {
        collection.index = await this.buildHNSWIndex(collection);
        console.log(`🔍 Built HNSW index for collection: ${name}`);
      }
    }
  }

  async rebuildIndices(collections: Map<string, VectorCollection>): Promise<void> {
    await this.buildIndices(collections);
  }

  async addToIndex(collection: VectorCollection, entry: VectorEntry): Promise<void> {
    // In production, update the actual index structure
    console.log(`➕ Added vector ${entry.id} to ${collection.name} index`);
  }

  async search(
    collection: VectorCollection,
    queryVector: number[],
    options: SearchOptions
  ): Promise<SearchResult[]> {
    // Mock indexed search - in production, use actual index
    const results: SearchResult[] = [];
    
    for (const [id, entry] of collection.vectors) {
      if (options.filters && !this.matchesFilters(entry.metadata, options.filters)) {
        continue;
      }

      const similarity = this.cosineSimilarity(queryVector, entry.vector);
      
      if (similarity >= (options.threshold || 0.5)) {
        results.push({
          id,
          similarity,
          metadata: entry.metadata,
          content: entry.metadata.content || '',
          source: collection.name
        });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, options.limit || 10);
  }

  async getIndexSize(): Promise<number> {
    // Mock index size calculation
    return 1024 * 1024; // 1MB
  }

  private async buildHNSWIndex(collection: VectorCollection): Promise<any> {
    // Mock HNSW index - in production, use libraries like hnswlib or faiss
    return {
      type: 'hnsw',
      vectorCount: collection.vectors.size,
      builtAt: new Date()
    };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private matchesFilters(metadata: Record<string, any>, filters: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(filters)) {
      if (metadata[key] !== value) {
        return false;
      }
    }
    return true;
  }
}

// Supporting interfaces
interface VectorEntry {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
  createdAt: Date;
}

interface VectorCollection {
  name: string;
  config: CollectionConfig;
  vectors: Map<string, VectorEntry>;
  index: any;
  createdAt: Date;
  lastUpdated: Date;
}

interface CollectionConfig {
  description: string;
  vectorDimension: number;
  indexType: 'hnsw' | 'flat' | 'ivf';
  retentionDays: number;
}

interface SearchOptions {
  collections?: string[];
  limit?: number;
  threshold?: number;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SearchResult {
  id: string;
  similarity: number;
  metadata: Record<string, any>;
  content: string;
  source: string;
}

interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  timestamp: Date;
  sentiment?: number;
}

interface ConversationContext {
  userId: string;
  sessionId?: string;
  messages: ConversationMessage[];
  summary: string;
  topics: string[];
  sentiment: number;
  retrievedAt: Date;
}

interface UserRAGContext {
  userId: string;
  sessionId?: string;
  preferences?: Record<string, any>;
  historicalContext?: boolean;
}

interface RAGContext {
  query: string;
  userId: string;
  retrievedDocuments: Array<{
    id: string;
    content: string;
    title: string;
    source: string;
    relevanceScore: number;
  }>;
  conversationHistory: Array<{
    role: string;
    content: string;
    timestamp: Date;
    relevanceScore: number;
  }>;
  userPatterns: Record<string, any>;
  contextSummary: string;
  confidence: number;
  sources: string[];
  retrievedAt: Date;
}

interface CombinedRAGContext {
  documents: any[];
  conversation: any[];
  patterns: Record<string, any>;
  summary: string;
  confidence: number;
  sources: string[];
}

interface UserPattern {
  type: string;
  description: string;
  context: string[];
  frequency: number;
  confidence: number;
  lastObserved: Date;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: Date;
}

interface VectorDatabaseStats {
  totalVectors: number;
  totalCollections: number;
  collections: Record<string, {
    vectorCount: number;
    avgVectorSize: number;
    lastUpdated: Date;
  }>;
  indexSize: number;
  memoryUsageMB: number;
  lastUpdated: Date;
}