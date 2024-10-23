export interface ResearchData {
  id: string;
  content: string;
  source: string;
  timestamp: Date;
  metadata?: {
    industry?: string;
    region?: string;
    timeframe?: string;
  };
}

// Simulated data sources
const DATA_SOURCES = [
  'Market Reports',
  'Financial Statements',
  'Industry News',
  'Competitor Analysis',
  'Economic Indicators'
];

// Simulated industries
const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail'
];

// Simulated regions
const REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East'
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateResearchData(): ResearchData {
  return {
    id: Date.now().toString(),
    content: `Analysis of ${getRandomItem(INDUSTRIES)} sector trends in ${getRandomItem(REGIONS)}`,
    source: getRandomItem(DATA_SOURCES),
    timestamp: new Date(),
    metadata: {
      industry: getRandomItem(INDUSTRIES),
      region: getRandomItem(REGIONS),
      timeframe: '2024-2025'
    }
  };
}

export async function processData(): Promise<ResearchData[]> {
  // Simulate data processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Generate 3-5 research data points
  const count = Math.floor(Math.random() * 3) + 3;
  const data: ResearchData[] = [];

  for (let i = 0; i < count; i++) {
    data.push(generateResearchData());
    // Simulate processing time for each data point
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return data;
}

export async function validateData(data: ResearchData[]): Promise<boolean> {
  // Simulate validation delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Basic validation
  return data.every(item => 
    item.id &&
    item.content &&
    item.source &&
    item.timestamp &&
    item.metadata?.industry &&
    item.metadata?.region
  );
}

export async function enrichData(data: ResearchData[]): Promise<ResearchData[]> {
  // Simulate enrichment delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Add additional metadata
  return data.map(item => ({
    ...item,
    metadata: {
      ...item.metadata,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      lastUpdated: new Date().toISOString()
    }
  }));
}
