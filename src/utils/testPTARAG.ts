/**
 * Simple test utility for PTA RAG System
 * Run this to verify the RAG integration is working
 */

import { ptaRAG } from './ptaRagSystem';

export function testPTARAG() {
  console.log('🧪 Testing PTA RAG System...\n');

  // Test 1: PTA-related query detection
  const ptaQueries = [
    'How are PTA officers elected?',
    'What are the financial requirements for PTA?',
    'Can you tell me about PTA meetings?',
    'How to organize fundraising activities?'
  ];

  const nonPtaQueries = [
    'How to use the weather app?',
    'What is the STEM calculator?',
    'How do I make a donation?'
  ];

  console.log('📍 Testing query classification:');
  ptaQueries.forEach(query => {
    const isPTA = ptaRAG.isPTARelated(query);
    console.log(`✅ "${query}" - PTA: ${isPTA}`);
  });

  nonPtaQueries.forEach(query => {
    const isPTA = ptaRAG.isPTARelated(query);
    console.log(`❌ "${query}" - PTA: ${isPTA}`);
  });

  // Test 2: Search functionality
  console.log('\n📍 Testing search functionality:');
  const searchQuery = 'PTA officers elections';
  const hits = ptaRAG.search(searchQuery, 3);
  console.log(`Query: "${searchQuery}"`);
  console.log(`Found ${hits.length} relevant chunks:`);
  hits.forEach((hit, index) => {
    console.log(`${index + 1}. Score: ${hit.score.toFixed(3)} | Page: ${hit.page} | ID: ${hit.chunk_id}`);
    console.log(`   Text: ${hit.text.substring(0, 100)}...`);
  });

  // Test 3: Complete RAG workflow
  console.log('\n📍 Testing complete RAG workflow:');
  const testQuestion = 'How should PTA elections be conducted?';
  const result = ptaRAG.ask(testQuestion, 3);
  console.log(`Question: "${testQuestion}"`);
  console.log(`Answer: ${result.answer}`);
  console.log(`Citations: ${result.citations.join(', ')}`);

  // Test 4: Categories
  console.log('\n📍 Available categories:');
  const categories = ptaRAG.getCategories();
  console.log(categories.join(', '));

  console.log('\n✅ PTA RAG System test completed!');
  
  return {
    queryClassification: { ptaQueries, nonPtaQueries },
    searchTest: { query: searchQuery, hits },
    ragTest: { question: testQuestion, result },
    categories
  };
}

// Export for manual testing
export { ptaRAG };