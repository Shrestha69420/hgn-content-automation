/**
 * ==============================================================================
 * CONTENT QUALITY REPORT ADAPTER
 * Organization: Himalayan Guardian Nepal
 * Platform: HGN Marketing Hub
 *
 * There is ONE scoring engine: the 7-rule deterministic service in
 * `services/contentScoringService.ts`. This module only reshapes its result
 * into the `ContentQualityReport` stored on posts, so the Generator, Quality
 * Scorer, Library, Dashboard and Analytics always show the same score.
 * ==============================================================================
 */

import { ContentQualityReport, DimensionScore, Platform, QualityRuleResult } from '../types';
import {
  calculateTotalContentScore,
  ContentObjective,
  ScoringPlatform,
  BreakdownItem,
} from '../services/contentScoringService';

export const DEFAULT_PRIMARY_KEYWORD = 'Nepal trekking safety';
export const DEFAULT_OBJECTIVE: ContentObjective = 'Education';
export const ALGORITHM_VERSION = 'HGN-7RULE-v2.0';

export function toScoringPlatform(p: Platform): ScoringPlatform {
  if (p === 'Facebook') return 'Facebook';
  if (p === 'LinkedIn' || p === 'Blog') return 'LinkedIn';
  if (p === 'Twitter') return 'X/Twitter';
  return 'Instagram';
}

export function letterGradeFor(score: number): ContentQualityReport['letterGrade'] {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

/** Full text that gets scored: title (if any), body, plus CTA/hashtags not already in the body. */
export function buildScoredText(content: string, hashtags: string[] = [], cta = '', title = ''): string {
  const parts = [title, content];
  if (cta && !content.includes(cta)) parts.push(cta);
  const missingTags = hashtags.filter(t => !content.includes(t));
  if (missingTags.length) parts.push(missingTags.join(' '));
  return parts.filter(p => p && p.trim()).join('\n\n').trim();
}

export interface EvaluateOptions {
  title?: string;
  primaryKeyword?: string;
  objective?: string;
}

export function evaluateContentQuality(
  content: string,
  platform: Platform = 'Instagram',
  hashtags: string[] = [],
  cta: string = '',
  options: EvaluateOptions = {}
): ContentQualityReport {
  const text = buildScoredText(content, hashtags, cta, options.title);
  const result = calculateTotalContentScore({
    content: text,
    platform: toScoringPlatform(platform),
    primaryKeyword: options.primaryKeyword || DEFAULT_PRIMARY_KEYWORD,
    objective: (options.objective as ContentObjective) || DEFAULT_OBJECTIVE,
  });

  const items = Object.values(result.breakdown) as BreakdownItem[];
  const dimensions: DimensionScore[] = items.map(i => ({
    name: i.name,
    key: i.key,
    weight: i.maxScore / result.maxScore,
    score: i.maxScore ? Math.round((i.score / i.maxScore) * 100) : 0,
    weightedScore: i.score,
    rulesPassed: i.status === 'passed' ? 1 : 0,
    totalRules: 1,
  }));
  const rules: QualityRuleResult[] = items.map((i, idx) => ({
    ruleId: `R${idx + 1}`,
    category: i.key,
    title: i.name,
    status: i.status,
    earnedScore: i.score,
    maxScore: i.maxScore,
    rationale: i.details,
    codeCondition: i.ruleExplanation,
    ruleExplanation: i.ruleExplanation,
    improvementSuggestion: i.status === 'passed' ? undefined : i.details,
  }));

  return {
    overallScore: result.totalScore,
    letterGrade: letterGradeFor(result.totalScore),
    calculatedAt: new Date().toISOString(),
    evaluatedWordCount: result.wordCount,
    evaluatedCharCount: result.charCount,
    estimatedReadTimeSec: Math.max(1, Math.round((result.wordCount / 200) * 60)),
    dimensions,
    rules,
    compliancePassed: result.totalScore >= 75,
    algorithmVersion: ALGORITHM_VERSION,
  };
}
