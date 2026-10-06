/**
 * Core Type Definitions for Himalayan Guardian Nepal
 * Marketing Content Automation and Social Media Management System
 */

export type Platform = 'Instagram' | 'Facebook' | 'LinkedIn' | 'Twitter' | 'Blog';

export type ContentStatus = 'Draft' | 'Ready' | 'In Review' | 'Approved' | 'Scheduled' | 'Published';

export type ContentCategory = 
  | 'Trekking Safety'
  | 'Altitude Awareness'
  | 'Travel Preparation'
  | 'Nepal Tourism'
  | 'Emergency Support'
  | 'Product Awareness'
  | 'Educational Content'
  | 'Seasonal Campaign'
  | 'Trekking Awareness'
  | 'Travel Safety'
  | 'Product Campaign'
  | 'Social Media Caption'
  | 'Marketing Campaign'
  | 'SEO Article'
  | 'Emergency Advisory';

export type HGNProductService =
  | 'CTG — Comprehensive Tourism Guard'
  | 'Trekking Safety Awareness'
  | 'High Altitude Safety'
  | 'Nepal Travel Safety'
  | 'Emergency Coordination'
  | 'General HGN Brand Awareness';

export type TargetAudience =
  | 'International Trekkers'
  | 'Adventure Travellers'
  | 'Nepal Visitors'
  | 'Trekking Agencies'
  | 'Travel Agencies'
  | 'High Altitude Travellers'
  | 'Southeast Asian Travellers'
  | 'European Travellers';

export type UserRole = 'Marketing Officer' | 'Content Strategist' | 'Mountain Safety Director' | 'Social Media Specialist';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  department?: string;
}

export interface Campaign {
  id: string;
  name: string;
  code: string;
  description: string;
  category: ContentCategory;
  startDate: string;
  endDate: string;
  season: 'Autumn Peak' | 'Spring Everest' | 'Monsoon Safety' | 'Winter High-Pass';
  targetAudience: string;
  targetChannels: Platform[];
  budgetNPR: number;
  status: 'Planning' | 'Active' | 'Completed' | 'Archived';
  kpis: {
    targetReach: number;
    currentReach: number;
    targetEngagement: number;
    postsPlanned: number;
    postsPublished: number;
  };
  safetyFocus: string;
}

export interface QualityRuleResult {
  ruleId: string;
  category: string;
  title: string;
  status: 'passed' | 'warning' | 'failed';
  earnedScore: number;
  maxScore: number;
  rationale: string;
  codeCondition: string; // Plaintext code rule condition for deterministic inspection
  ruleExplanation: string;
  improvementSuggestion?: string;
}

export interface DimensionScore {
  name: string;
  key: string;
  weight: number; // e.g., 0.25
  score: number; // 0 to 100
  weightedScore: number; // weight * score
  rulesPassed: number;
  totalRules: number;
}

export interface ContentQualityReport {
  overallScore: number; // 0 to 100
  letterGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  calculatedAt: string;
  evaluatedWordCount: number;
  evaluatedCharCount: number;
  estimatedReadTimeSec: number;
  dimensions: DimensionScore[];
  rules: QualityRuleResult[];
  compliancePassed: boolean;
  algorithmVersion: string;
}

export interface ContentPost {
  id: string;
  campaignId: string;
  campaignName: string;
  title: string;
  content: string;
  category: ContentCategory;
  platform: Platform;
  status: ContentStatus;
  author: string;
  createdAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  hashtags: string[];
  callToAction: string;
  visualPrompt?: string;
  primaryKeyword?: string;
  objective?: string;
  qualityReport?: ContentQualityReport;
  deterministicScoreResult?: any;
  analytics?: {
    impressions: number;
    reach: number;
    engagements: number;
    shares: number;
    saves: number;
    ctr: number; // Click-through rate %
  };
  versionHistory?: {
    timestamp: string;
    score: number;
    editor: string;
    summary: string;
  }[];
}

export interface CalendarEvent {
  id: string;
  postId: string;
  title: string;
  platform: Platform;
  dateTime: string;
  status: ContentStatus;
  campaignName: string;
  qualityScore?: number;
}

export interface MarketingAnalyticsOverview {
  totalContentCreated: number;
  scheduledQueueCount: number;
  avgQualityScore: number;
  totalReachSeason: number;
  avgEngagementRate: number;
  safetyAlertsPublished: number;
  channelPerformance: {
    platform: Platform;
    postsCount: number;
    totalReach: number;
    avgEngagement: number;
    conversionRate: number;
  }[];
}
