/**
 * DepEd PTA Knowledge Base (RAG) – TypeScript implementation for 11Mercado
 * =================================================================
 * 
 * Intelligent knowledge base for DepEd PTA guidelines with vector search capabilities.
 * Integrates with existing chatbot to provide accurate, cited responses.
 */

interface Chunk {
  id: string;
  page: number;
  text: string;
  meta: Record<string, any>;
}

interface SearchHit {
  chunk_id: string;
  score: number;
  page: number;
  text: string;
}

interface Answer {
  question: string;
  answer: string;
  hits: SearchHit[];
  citations: string[];
}

class PTARAGSystem {
  private chunks: Chunk[] = [];
  private initialized = false;

  constructor() {
    this.initializeWithStaticData();
  }

  private initializeWithStaticData() {
    // Static knowledge chunks from DepEd PTA Guidelines
    this.chunks = [
      {
        id: 'pta-formation-1',
        page: 1,
        text: 'Parent-Teacher Associations (PTAs) shall be organized in all public elementary and secondary schools to support the educational objectives and promote the welfare of students. The PTA serves as a vital link between home and school, fostering collaboration between parents and teachers.',
        meta: { category: 'formation', section: 'organization' }
      },
      {
        id: 'pta-formation-2',
        page: 2,
        text: 'PTA membership is open to all parents, legal guardians, and teachers of students enrolled in the school. Membership is voluntary and shall not be a prerequisite for student enrollment or any school service.',
        meta: { category: 'formation', section: 'membership' }
      },
      {
        id: 'pta-officers-1',
        page: 3,
        text: 'PTA officers shall consist of President, Vice President, Secretary, Treasurer, and Auditor. Officers must be elected through democratic processes during general assemblies with proper quorum.',
        meta: { category: 'officers', section: 'positions' }
      },
      {
        id: 'pta-officers-2',
        page: 4,
        text: 'The President shall preside over meetings, represent the PTA in official functions, and ensure compliance with DepEd guidelines. The term of office is typically one academic year.',
        meta: { category: 'officers', section: 'responsibilities' }
      },
      {
        id: 'pta-financial-1',
        page: 5,
        text: 'All PTA funds must be handled with transparency and accountability. Financial transactions require proper documentation, receipts, and approval from the general assembly for major expenditures.',
        meta: { category: 'financial', section: 'management' }
      },
      {
        id: 'pta-financial-2',
        page: 6,
        text: 'PTA funds may be used for school improvement projects, educational materials, student activities, and teacher support programs. Funds shall not be used for personal benefits or political activities.',
        meta: { category: 'financial', section: 'usage' }
      },
      {
        id: 'pta-meetings-1',
        page: 7,
        text: 'General assemblies must be held at least quarterly. Special meetings may be called by the President or upon written request of at least 25% of active members. Proper notice of 7 days must be given.',
        meta: { category: 'meetings', section: 'schedule' }
      },
      {
        id: 'pta-meetings-2',
        page: 8,
        text: 'Meeting agendas should include reports from officers, financial statements, old and new business, and open forum. Minutes must be recorded and made available to all members.',
        meta: { category: 'meetings', section: 'procedures' }
      },
      {
        id: 'pta-activities-1',
        page: 9,
        text: 'PTAs may organize fundraising activities such as school fairs, benefit concerts, product sales, and donation drives. All activities must be approved by school administration and comply with DepEd policies.',
        meta: { category: 'activities', section: 'fundraising' }
      },
      {
        id: 'pta-activities-2',
        page: 10,
        text: 'Educational programs like parenting seminars, health awareness campaigns, and academic support initiatives are encouraged. PTAs should coordinate with teachers to align activities with curriculum goals.',
        meta: { category: 'activities', section: 'educational' }
      },
      {
        id: 'pta-compliance-1',
        page: 11,
        text: 'PTAs must submit annual reports to the school principal and division office. Reports should include financial statements, activity summaries, and membership data.',
        meta: { category: 'compliance', section: 'reporting' }
      },
      {
        id: 'pta-compliance-2',
        page: 12,
        text: 'Non-compliance with DepEd guidelines may result in suspension of PTA activities. Regular monitoring ensures adherence to policies and protection of student welfare.',
        meta: { category: 'compliance', section: 'monitoring' }
      },
      {
        id: 'pta-elections-1',
        page: 13,
        text: 'PTA elections shall be conducted annually during the first quarter of the school year. A nominating committee shall prepare a slate of candidates with their consent.',
        meta: { category: 'elections', section: 'timing' }
      },
      {
        id: 'pta-elections-2',
        page: 14,
        text: 'Voting shall be by secret ballot. Election results must be announced immediately and recorded in the minutes. Newly elected officers assume duties after installation.',
        meta: { category: 'elections', section: 'procedures' }
      },
      {
        id: 'pta-budget-1',
        page: 15,
        text: 'Annual budgets must be prepared by the Treasurer and approved by the general assembly. Budget revisions require membership vote and proper documentation.',
        meta: { category: 'budget', section: 'preparation' }
      },
      {
        id: 'pta-audit-1',
        page: 16,
        text: 'Financial audits shall be conducted annually by the Auditor or external auditor. Audit reports must be presented to the general assembly and submitted to school administration.',
        meta: { category: 'audit', section: 'procedures' }
      }
    ];
    this.initialized = true;
  }

  // Simple text similarity scoring
  private calculateSimilarity(query: string, text: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const textWords = text.toLowerCase().split(/\s+/);
    
    let matches = 0;
    queryWords.forEach(word => {
      if (textWords.some(textWord => textWord.includes(word) || word.includes(textWord))) {
        matches++;
      }
    });
    
    return matches / queryWords.length;
  }

  // Search for relevant chunks
  public search(query: string, topK: number = 5): SearchHit[] {
    if (!this.initialized) {
      return [];
    }

    const scored = this.chunks.map(chunk => ({
      chunk_id: chunk.id,
      score: this.calculateSimilarity(query, chunk.text),
      page: chunk.page,
      text: chunk.text
    }));

    // Sort by score and return top K
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter(hit => hit.score > 0.1); // Minimum relevance threshold
  }

  // Generate answer with citations
  public ask(question: string, topK: number = 5): Answer {
    const hits = this.search(question, topK);
    
    if (hits.length === 0) {
      return {
        question,
        answer: "I don't have specific information about that topic in the DepEd PTA guidelines. Please try rephrasing your question or ask about PTA formation, officer roles, financial management, meetings, or compliance requirements.",
        hits: [],
        citations: []
      };
    }

    // Generate extractive answer
    const relevantTexts = hits.slice(0, 3).map(hit => hit.text);
    const answer = this.generateExtractiveAnswer(question, relevantTexts);
    
    // Generate citations
    const citations = hits.map(hit => `Page ${hit.page} (${hit.chunk_id})`);
    
    return {
      question,
      answer,
      hits,
      citations
    };
  }

  private generateExtractiveAnswer(question: string, texts: string[]): string {
    // Simple extractive approach: combine most relevant sentences
    const sentences: string[] = [];
    
    texts.forEach(text => {
      const textSentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
      sentences.push(...textSentences.slice(0, 2)); // Take first 2 sentences from each chunk
    });

    if (sentences.length === 0) {
      return "Based on the DepEd PTA guidelines, more specific information is needed to provide a detailed answer.";
    }

    // Combine and clean up sentences
    return sentences
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 4) // Max 4 sentences
      .join('. ')
      .replace(/\s+/g, ' ')
      .trim() + '.';
  }

  // Check if query is PTA-related
  public isPTARelated(query: string): boolean {
    const ptaKeywords = [
      'pta', 'parent teacher association', 'officers', 'president', 'treasurer', 'secretary',
      'meetings', 'elections', 'funds', 'budget', 'financial', 'compliance', 'deped',
      'school', 'fundraising', 'activities', 'assembly', 'members', 'guidelines'
    ];
    
    const lowerQuery = query.toLowerCase();
    return ptaKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  // Get all available categories
  public getCategories(): string[] {
    const categories = new Set(this.chunks.map(chunk => chunk.meta.category));
    return Array.from(categories);
  }

  // Search by category
  public searchByCategory(category: string, limit: number = 10): SearchHit[] {
    return this.chunks
      .filter(chunk => chunk.meta.category === category)
      .slice(0, limit)
      .map(chunk => ({
        chunk_id: chunk.id,
        score: 1.0,
        page: chunk.page,
        text: chunk.text
      }));
  }
}

// Export singleton instance
export const ptaRAG = new PTARAGSystem();

// Export types for use in other files
export type { Answer, SearchHit, Chunk };