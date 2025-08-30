export type Metrics = {
  cryptography: number;
  distributedSystems: number;
  economics: number;
  coding: number;
  writing: number;
  community: number;
};

export function satoshiScore(metrics: Metrics): number {
  // Calculate a weighted score out of 100
  // Each metric is 0-10, so we normalize and weight them
  const weights = {
    cryptography: 20,      // 20% - Core to Bitcoin's security
    distributedSystems: 18, // 18% - P2P network design
    economics: 15,         // 15% - Monetary theory understanding
    coding: 17,            // 17% - Implementation skills
    writing: 15,           // 15% - Clear communication
    community: 15,         // 15% - Building consensus
  };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  for (const [metric, value] of Object.entries(metrics)) {
    const weight = weights[metric as keyof typeof weights] || 0;
    totalScore += (value / 10) * weight;
    totalWeight += weight;
  }
  
  return Math.round((totalScore / totalWeight) * 100);
}