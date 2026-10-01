/**
 * ==============================================================================
 * CONTENT QUALITY SCORING SERVICE (DETERMINISTIC BUSINESS LOGIC)
 * Organization: Himalayan Guardian Nepal (HGN / CTG)
 * Platform: HGN Marketing Hub
 * 
 * SPECIFICATION:
 * This scoring service uses deterministic business logic to evaluate marketing copy:
 * - Deterministic, rule-based verification.
 * - Platform-specific length and hashtag calibration.
 * - Himalayan Guardian brand, keyword, and CTA enforcement.
 * ==============================================================================
 */

export type ScoringPlatform = 'Facebook' | 'Instagram' | 'LinkedIn' | 'X/Twitter';

export type ContentObjective = 
  | 'Brand Awareness'
  | 'Engagement'
  | 'Website Traffic'
  | 'Lead Generation'
  | 'Education';

export type ScoreRating = 'Excellent' | 'Good' | 'Needs Improvement' | 'Weak';

export interface BreakdownItem {
  name: string;
  key: 'caption' | 'cta' | 'brand' | 'keyword' | 'hashtags' | 'readability' | 'objective';
  score: number;
  maxScore: number;
  status: 'passed' | 'warning' | 'failed';
  details: string;
  ruleExplanation: string;
}

export interface ContentScoreResult {
  totalScore: number;
  maxScore: number;
  rating: ScoreRating;
  ratingColor: string;
  charCount: number;
  wordCount: number;
  hashtagCount: number;
  breakdown: {
    captionLength: BreakdownItem;
    cta: BreakdownItem;
    brandMention: BreakdownItem;
    primaryKeyword: BreakdownItem;
    hashtags: BreakdownItem;
    readability: BreakdownItem;
    objectiveMatch: BreakdownItem;
  };
  recommendations: string[];
}

export interface ContentScoreInput {
  content: string;
  platform: ScoringPlatform;
  primaryKeyword: string;
  objective: ContentObjective;
}

// -----------------------------------------------------------------------------
// RULE 1: Caption Length — 15 Points
// -----------------------------------------------------------------------------
/**
 * Evaluates character length based on social media platform sweet-spots.
 * 
 * Rules:
 * Facebook:
 *   80–300 chars   => 15 pts
 *   40–79 or 301–500 => 8 pts
 *   otherwise      => 3 pts
 * 
 * Instagram:
 *   100–400 chars  => 15 pts
 *   50–99 or 401–700 => 8 pts
 *   otherwise      => 3 pts
 * 
 * LinkedIn:
 *   100–600 chars  => 15 pts
 *   50–99 or 601–1000 => 8 pts
 *   otherwise      => 3 pts
 * 
 * X/Twitter:
 *   40–240 chars   => 15 pts
 *   otherwise      => 5 pts
 */
export function calculateCaptionScore(
  charCount: number,
  platform: ScoringPlatform
): { score: number; details: string; recommendation?: string } {
  switch (platform) {
    case 'Facebook':
      if (charCount >= 80 && charCount <= 300) {
        return {
          score: 15,
          details: `${charCount} chars is within the optimal Facebook range (80–300 chars).`,
        };
      } else if ((charCount >= 40 && charCount <= 79) || (charCount >= 301 && charCount <= 500)) {
        return {
          score: 8,
          details: `${charCount} chars is in the secondary acceptable range (40–79 or 301–500 chars).`,
          recommendation: charCount > 300
            ? 'Trim your caption to between 80 and 300 characters for optimal Facebook engagement.'
            : 'Expand your caption to at least 80 characters for better narrative depth on Facebook.',
        };
      } else {
        return {
          score: 3,
          details: `${charCount} chars falls outside optimal and secondary Facebook ranges.`,
          recommendation: charCount < 40
            ? 'Caption is too short. Aim for 80–300 characters on Facebook.'
            : 'Caption is overly long. Keep Facebook posts between 80 and 300 characters.',
        };
      }

    case 'Instagram':
      if (charCount >= 100 && charCount <= 400) {
        return {
          score: 15,
          details: `${charCount} chars is within the optimal Instagram range (100–400 chars).`,
        };
      } else if ((charCount >= 50 && charCount <= 99) || (charCount >= 401 && charCount <= 700)) {
        return {
          score: 8,
          details: `${charCount} chars is in the secondary acceptable Instagram range (50–99 or 401–700 chars).`,
          recommendation: charCount > 400
            ? 'Consider condensing your Instagram caption to 100–400 characters to keep attention above the fold.'
            : 'Elaborate your caption to reach at least 100 characters on Instagram.',
        };
      } else {
        return {
          score: 3,
          details: `${charCount} chars falls outside recommended Instagram lengths.`,
          recommendation: charCount < 50
            ? 'Instagram caption is very brief. Target 100–400 characters.'
            : 'Instagram caption exceeds 700 characters. Trim to 100–400 characters.',
        };
      }

    case 'LinkedIn':
      if (charCount >= 100 && charCount <= 600) {
        return {
          score: 15,
          details: `${charCount} chars is within the professional LinkedIn range (100–600 chars).`,
        };
      } else if ((charCount >= 50 && charCount <= 99) || (charCount >= 601 && charCount <= 1000)) {
        return {
          score: 8,
          details: `${charCount} chars is in the secondary acceptable LinkedIn range (50–99 or 601–1000 chars).`,
          recommendation: charCount > 600
            ? 'Consider structuring long LinkedIn text into bulleted paragraphs or trimming below 600 chars.'
            : 'Expand your professional context to at least 100 characters on LinkedIn.',
        };
      } else {
        return {
          score: 3,
          details: `${charCount} chars falls outside standard LinkedIn brackets.`,
          recommendation: charCount < 50
            ? 'LinkedIn post is too concise. Target 100–600 characters with professional insights.'
            : 'LinkedIn post exceeds 1,000 characters. Condense for better executive readership.',
        };
      }

    case 'X/Twitter':
      if (charCount >= 40 && charCount <= 240) {
        return {
          score: 15,
          details: `${charCount} chars fits comfortably within X/Twitter 40–240 character sweet-spot.`,
        };
      } else {
        return {
          score: 5,
          details: `${charCount} chars is outside the recommended 40–240 character window for X/Twitter.`,
          recommendation: charCount < 40
            ? 'Your X/Twitter post is too brief. Provide more context (40–240 chars).'
            : 'Your X/Twitter post exceeds 240 characters. Trim to leave room for retweets/replies.',
        };
      }
  }
}

// -----------------------------------------------------------------------------
// RULE 2: Call to Action — 15 Points
// -----------------------------------------------------------------------------
export const MANDATORY_CTA_PHRASES = [
  'learn more',
  'discover more',
  'read more',
  'explore',
  'visit',
  'get started',
  'know more',
  'prepare',
  'travel prepared',
  'contact us',
];

/**
 * Checks whether content contains at least one approved marketing CTA phrase.
 * If CTA exists: 15 points
 * Otherwise: 0 points
 */
export function calculateCTAScore(content: string): {
  score: number;
  matchedCTA: string | null;
  details: string;
  recommendation?: string;
} {
  const lowerContent = content.toLowerCase();
  
  for (const phrase of MANDATORY_CTA_PHRASES) {
    // Regex boundary check to prevent false substring matches where appropriate
    const regex = new RegExp(`\\b${phrase}\\b`, 'i');
    if (regex.test(lowerContent)) {
      return {
        score: 15,
        matchedCTA: phrase,
        details: `CTA phrase matched: "${phrase}". Drives user action.`,
      };
    }
  }

  return {
    score: 0,
    matchedCTA: null,
    details: 'No recognized Call to Action phrase found.',
    recommendation: 'Add a clear call to action (e.g., "learn more", "travel prepared", "contact us", "visit").',
  };
}

// -----------------------------------------------------------------------------
// RULE 3: HGN Brand Mention — 10 Points
// -----------------------------------------------------------------------------
export const BRAND_VARIANTS = [
  'Himalayan Guardian Nepal',
  'HGN',
  'CTG',
];

/**
 * Validates brand identity presence.
 * If content contains "Himalayan Guardian Nepal", "HGN", or "CTG": 10 points
 * Otherwise: 0 points
 */
export function calculateBrandScore(content: string): {
  score: number;
  matchedBrand: string | null;
  details: string;
  recommendation?: string;
} {
  const lowerContent = content.toLowerCase();

  // Test full brand first
  if (lowerContent.includes('himalayan guardian nepal')) {
    return {
      score: 10,
      matchedBrand: 'Himalayan Guardian Nepal',
      details: 'Full brand name "Himalayan Guardian Nepal" present.',
    };
  }

  // Test acronyms with word boundaries
  const hgnRegex = /\b(hgn)\b/i;
  if (hgnRegex.test(content)) {
    return {
      score: 10,
      matchedBrand: 'HGN',
      details: 'Brand acronym "HGN" verified with word boundary.',
    };
  }

  const ctgRegex = /\b(ctg)\b/i;
  if (ctgRegex.test(content)) {
    return {
      score: 10,
      matchedBrand: 'CTG',
      details: 'Brand identifier "CTG" verified with word boundary.',
    };
  }

  return {
    score: 0,
    matchedBrand: null,
    details: 'Missing brand mention ("Himalayan Guardian Nepal", "HGN", or "CTG").',
    recommendation: 'Mention Himalayan Guardian Nepal, HGN, or CTG to reinforce brand authority.',
  };
}

// -----------------------------------------------------------------------------
// RULE 4: Primary Keyword — 20 Points
// -----------------------------------------------------------------------------
/**
 * Evaluates inclusion of user-specified primary marketing keyword.
 * - Exact keyword present => 20 points
 * - Partial (some words from the keyword are present) => 10 points
 * - Absent => 0 points
 */
export function calculateKeywordScore(
  content: string,
  primaryKeyword: string
): {
  score: number;
  status: 'exact' | 'partial' | 'absent';
  details: string;
  recommendation?: string;
} {
  const cleanKeyword = primaryKeyword.trim().toLowerCase();
  if (!cleanKeyword) {
    return {
      score: 0,
      status: 'absent',
      details: 'No primary keyword entered.',
      recommendation: 'Enter and include a primary keyword (e.g., "Nepal trekking insurance", "high altitude safety").',
    };
  }

  const lowerContent = content.toLowerCase();

  // 1. Exact match check
  if (lowerContent.includes(cleanKeyword)) {
    return {
      score: 20,
      status: 'exact',
      details: `Exact primary keyword "${primaryKeyword}" found in content.`,
    };
  }

  // 2. Partial match check (split keyword into tokens of length > 2)
  const keywordWords = cleanKeyword
    .split(/\s+/)
    .filter(w => w.length > 2 && !['and', 'the', 'for', 'with', 'in'].includes(w));

  const matchedWords = keywordWords.filter(word => {
    const reg = new RegExp(`\\b${word}\\b`, 'i');
    return reg.test(lowerContent);
  });

  if (matchedWords.length > 0) {
    return {
      score: 10,
      status: 'partial',
      details: `Partial keyword match: Found ${matchedWords.length}/${keywordWords.length} words ("${matchedWords.join('", "')}").`,
      recommendation: `Include the exact phrase "${primaryKeyword}" rather than isolated words to earn full points.`,
    };
  }

  // 3. Absent
  return {
    score: 0,
    status: 'absent',
    details: `Primary keyword "${primaryKeyword}" is absent from copy.`,
    recommendation: `Include the primary keyword "${primaryKeyword}" in your marketing post.`,
  };
}

// -----------------------------------------------------------------------------
// RULE 5: Hashtag Score — 15 Points
// -----------------------------------------------------------------------------
/**
 * Evaluates hashtag volume per platform rules.
 * 
 * Instagram:
 *   5–12 hashtags => 15
 *   3–4 hashtags  => 8
 *   otherwise     => 3
 * 
 * LinkedIn:
 *   3–5 hashtags  => 15
 *   1–2 or 6–8    => 8
 *   otherwise     => 3
 * 
 * Facebook:
 *   1–5 hashtags  => 15
 *   otherwise     => 5
 * 
 * X/Twitter:
 *   1–3 hashtags  => 15
 *   otherwise     => 5
 */
export function calculateHashtagScore(
  hashtagCount: number,
  platform: ScoringPlatform
): { score: number; details: string; recommendation?: string } {
  switch (platform) {
    case 'Instagram':
      if (hashtagCount >= 5 && hashtagCount <= 12) {
        return {
          score: 15,
          details: `${hashtagCount} hashtags meets Instagram sweet spot (5–12 tags).`,
        };
      } else if (hashtagCount >= 3 && hashtagCount <= 4) {
        return {
          score: 8,
          details: `${hashtagCount} hashtags is slightly under optimal Instagram reach (target 5–12).`,
          recommendation: 'Add 1–2 more targeted hashtags to reach the 5–12 tag threshold on Instagram.',
        };
      } else {
        return {
          score: 3,
          details: `${hashtagCount} hashtags is outside Instagram recommendations.`,
          recommendation: hashtagCount < 3
            ? 'Include at least 5 relevant hashtags on Instagram (e.g. #HimalayanGuardian #NepalTrekking).'
            : 'Reduce the number of hashtags to 12 or fewer to prevent algorithmic spam suppression.',
        };
      }

    case 'LinkedIn':
      if (hashtagCount >= 3 && hashtagCount <= 5) {
        return {
          score: 15,
          details: `${hashtagCount} hashtags is ideal for professional LinkedIn categorization (3–5 tags).`,
        };
      } else if ((hashtagCount >= 1 && hashtagCount <= 2) || (hashtagCount >= 6 && hashtagCount <= 8)) {
        return {
          score: 8,
          details: `${hashtagCount} hashtags is acceptable for LinkedIn (target 3–5).`,
          recommendation: hashtagCount > 5
            ? 'Reduce hashtags to 3–5 tags for LinkedIn professional content.'
            : 'Add 1–2 more focused industry hashtags on LinkedIn.',
        };
      } else {
        return {
          score: 3,
          details: `${hashtagCount} hashtags falls outside LinkedIn best practices.`,
          recommendation: hashtagCount === 0
            ? 'Add 3–5 relevant hashtags for LinkedIn categorization.'
            : 'Reduce the number of hashtags to 5 or fewer on LinkedIn.',
        };
      }

    case 'Facebook':
      if (hashtagCount >= 1 && hashtagCount <= 5) {
        return {
          score: 15,
          details: `${hashtagCount} hashtags is within Facebook recommended range (1–5 tags).`,
        };
      } else {
        return {
          score: 5,
          details: `${hashtagCount} hashtags is non-optimal for Facebook.`,
          recommendation: hashtagCount === 0
            ? 'Add 1–3 focused hashtags on Facebook.'
            : 'Reduce the number of hashtags to 5 or fewer on Facebook.',
        };
      }

    case 'X/Twitter':
      if (hashtagCount >= 1 && hashtagCount <= 3) {
        return {
          score: 15,
          details: `${hashtagCount} hashtags fits X/Twitter best practices (1–3 tags).`,
        };
      } else {
        return {
          score: 5,
          details: `${hashtagCount} hashtags is non-optimal for X/Twitter.`,
          recommendation: hashtagCount === 0
            ? 'Include 1–2 key hashtags for X/Twitter discovery.'
            : 'Reduce hashtags to 1–3 on X/Twitter to save character space.',
        };
      }
  }
}

// -----------------------------------------------------------------------------
// RULE 6: Readability — 10 Points
// -----------------------------------------------------------------------------
/**
 * Deterministic Readability Evaluation:
 * Start with 10 points.
 * - Subtract 2 points if any sentence exceeds 30 words.
 * - Subtract 2 points if excessive uppercase text is detected.
 * - Subtract 2 points if more than 3 exclamation marks are used.
 * Minimum score must be 0.
 */
export function calculateReadabilityScore(content: string): {
  score: number;
  deductions: string[];
  details: string;
  recommendations: string[];
} {
  let score = 10;
  const deductions: string[] = [];
  const recommendations: string[] = [];

  // Check 1: Sentence length exceeds 30 words
  // Split on ., !, ?, or newline
  const sentences = content
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let hasLongSentence = false;
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 30) {
      hasLongSentence = true;
      break;
    }
  }

  if (hasLongSentence) {
    score -= 2;
    deductions.push('Sentence exceeds 30 words (-2 pts)');
    recommendations.push('Shorten long sentences: keep them under 30 words for easier mobile reading.');
  }

  // Check 2: Excessive uppercase text
  // Detection condition: Either > 25% of alphabetic letters are uppercase (with text > 40 chars),
  // OR 3+ consecutive words in full uppercase.
  const lettersOnly = content.replace(/[^A-Za-z]/g, '');
  const uppercaseLetters = content.replace(/[^A-Z]/g, '');
  const uppercaseRatio = lettersOnly.length > 0 ? uppercaseLetters.length / lettersOnly.length : 0;
  
  // Consecutive uppercase words regex (e.g. "BUY NOW TODAY")
  const consecutiveCapsRegex = /\b[A-Z]{3,}\s+[A-Z]{3,}\s+[A-Z]{3,}\b/;
  const hasConsecutiveCaps = consecutiveCapsRegex.test(content);

  if ((lettersOnly.length > 40 && uppercaseRatio > 0.28) || hasConsecutiveCaps) {
    score -= 2;
    deductions.push('Excessive uppercase text detected (-2 pts)');
    recommendations.push('Avoid excessive all-caps text or shout-caps; use standard title case or sentence case.');
  }

  // Check 3: More than 3 exclamation marks
  const exclamationMatches = content.match(/!/g) || [];
  if (exclamationMatches.length > 3) {
    score -= 2;
    deductions.push(`More than 3 exclamation marks used (${exclamationMatches.length} found) (-2 pts)`);
    recommendations.push('Reduce exclamation marks to 3 or fewer to maintain a professional safety tone.');
  }

  // Enforce minimum score of 0
  score = Math.max(0, score);

  let details = 'Clean sentence pacing and typography.';
  if (deductions.length > 0) {
    details = `Deductions applied: ${deductions.join('; ')}.`;
  }

  return {
    score,
    deductions,
    details,
    recommendations,
  };
}

// -----------------------------------------------------------------------------
// RULE 7: Content Objective Match — 15 Points
// -----------------------------------------------------------------------------
export const OBJECTIVE_KEYWORD_DICTIONARIES: Record<ContentObjective, string[]> = {
  'Brand Awareness': [
    'himalayan guardian',
    'hgn',
    'nepal',
    'travel',
    'trekking',
  ],
  'Engagement': [
    'share',
    'comment',
    'tell us',
    'what do you think',
    'save this',
  ],
  'Website Traffic': [
    'learn more',
    'read more',
    'visit',
    'website',
    'discover',
  ],
  'Lead Generation': [
    'contact',
    'enquire',
    'inquire',
    'get started',
    'request',
    'quote',
  ],
  'Education': [
    'tips',
    'guide',
    'learn',
    'know',
    'safety',
    'how',
    'why',
  ],
};

/**
 * Evaluates alignment with the selected content marketing objective.
 * 
 * If at least 2 objective-related keywords appear: 15 points
 * If 1 appears: 8 points
 * Otherwise: 0 points
 */
export function calculateObjectiveScore(
  content: string,
  objective: ContentObjective
): {
  score: number;
  matchedKeywords: string[];
  details: string;
  recommendation?: string;
} {
  const dictionary = OBJECTIVE_KEYWORD_DICTIONARIES[objective] || [];
  const lowerContent = content.toLowerCase();

  const matchedKeywords: string[] = [];

  for (const term of dictionary) {
    // Check term presence (using boundary or direct inclusion for phrases)
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(lowerContent)) {
      matchedKeywords.push(term);
    }
  }

  if (matchedKeywords.length >= 2) {
    return {
      score: 15,
      matchedKeywords,
      details: `Matched ${matchedKeywords.length} ${objective} keywords ("${matchedKeywords.join('", "')}"). Maximum 15 points awarded.`,
    };
  } else if (matchedKeywords.length === 1) {
    return {
      score: 8,
      matchedKeywords,
      details: `Matched 1 ${objective} keyword ("${matchedKeywords[0]}"). 8 points awarded.`,
      recommendation: `Add at least one more ${objective} keyword from: ${dictionary.filter(k => !matchedKeywords.includes(k)).slice(0, 3).join(', ')}.`,
    };
  } else {
    return {
      score: 0,
      matchedKeywords: [],
      details: `No keywords matching the "${objective}" objective were found.`,
      recommendation: `Align with your "${objective}" objective by including terms such as: ${dictionary.slice(0, 4).join(', ')}.`,
    };
  }
}

// -----------------------------------------------------------------------------
// TOTAL CONTENT SCORE CALCULATION
// -----------------------------------------------------------------------------
/**
 * Master Deterministic Function
 * Aggregates all 7 rules into a total score out of 100 with rating and recommendations.
 */
export function calculateTotalContentScore(input: ContentScoreInput): ContentScoreResult {
  const { content, platform, primaryKeyword, objective } = input;
  const safeContent = content || '';

  // Extract metrics
  const charCount = safeContent.length;
  const words = safeContent.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Extract hashtags from content
  const extractedHashtags = safeContent.match(/#[A-Za-z0-9_]+/g) || [];
  const hashtagCount = extractedHashtags.length;

  // 1. Caption Length (15 pts)
  const captionRes = calculateCaptionScore(charCount, platform);

  // 2. Call to Action (15 pts)
  const ctaRes = calculateCTAScore(safeContent);

  // 3. Brand Mention (10 pts)
  const brandRes = calculateBrandScore(safeContent);

  // 4. Primary Keyword (20 pts)
  const keywordRes = calculateKeywordScore(safeContent, primaryKeyword);

  // 5. Hashtag Score (15 pts)
  const hashtagRes = calculateHashtagScore(hashtagCount, platform);

  // 6. Readability (10 pts)
  const readabilityRes = calculateReadabilityScore(safeContent);

  // 7. Content Objective Match (15 pts)
  const objectiveRes = calculateObjectiveScore(safeContent, objective);

  // Total Score Sum (Max 100)
  const totalScore = 
    captionRes.score +
    ctaRes.score +
    brandRes.score +
    keywordRes.score +
    hashtagRes.score +
    readabilityRes.score +
    objectiveRes.score;

  // Rating brackets:
  // 90–100: Excellent
  // 75–89: Good
  // 60–74: Needs Improvement
  // Below 60: Weak
  let rating: ScoreRating = 'Weak';
  let ratingColor = 'text-red-400 bg-red-950/60 border-red-800/60';

  if (totalScore >= 90) {
    rating = 'Excellent';
    ratingColor = 'text-emerald-300 bg-emerald-950/60 border-emerald-800/60';
  } else if (totalScore >= 75) {
    rating = 'Good';
    ratingColor = 'text-cyan-300 bg-cyan-950/60 border-cyan-800/60';
  } else if (totalScore >= 60) {
    rating = 'Needs Improvement';
    ratingColor = 'text-amber-300 bg-amber-950/60 border-amber-800/60';
  } else {
    rating = 'Weak';
    ratingColor = 'text-red-300 bg-red-950/60 border-red-800/60';
  }

  // Compile recommendations list
  const recommendations: string[] = [];
  if (ctaRes.recommendation) recommendations.push(ctaRes.recommendation);
  if (brandRes.recommendation) recommendations.push(brandRes.recommendation);
  if (keywordRes.recommendation) recommendations.push(keywordRes.recommendation);
  if (captionRes.recommendation) recommendations.push(captionRes.recommendation);
  if (hashtagRes.recommendation) recommendations.push(hashtagRes.recommendation);
  if (objectiveRes.recommendation) recommendations.push(objectiveRes.recommendation);
  readabilityRes.recommendations.forEach(r => recommendations.push(r));

  return {
    totalScore,
    maxScore: 100,
    rating,
    ratingColor,
    charCount,
    wordCount,
    hashtagCount,
    breakdown: {
      captionLength: {
        name: 'Caption Length',
        key: 'caption',
        score: captionRes.score,
        maxScore: 15,
        status: captionRes.score === 15 ? 'passed' : captionRes.score === 8 ? 'warning' : 'failed',
        details: captionRes.details,
        ruleExplanation: `Evaluated against ${platform} character length brackets.`,
      },
      cta: {
        name: 'Call to Action',
        key: 'cta',
        score: ctaRes.score,
        maxScore: 15,
        status: ctaRes.score === 15 ? 'passed' : 'failed',
        details: ctaRes.details,
        ruleExplanation: 'Checks presence of approved action verbs (e.g. learn more, travel prepared, explore, visit).',
      },
      brandMention: {
        name: 'HGN Brand Mention',
        key: 'brand',
        score: brandRes.score,
        maxScore: 10,
        status: brandRes.score === 10 ? 'passed' : 'failed',
        details: brandRes.details,
        ruleExplanation: 'Checks for "Himalayan Guardian Nepal", "HGN", or "CTG".',
      },
      primaryKeyword: {
        name: 'Primary Keyword',
        key: 'keyword',
        score: keywordRes.score,
        maxScore: 20,
        status: keywordRes.score === 20 ? 'passed' : keywordRes.score === 10 ? 'warning' : 'failed',
        details: keywordRes.details,
        ruleExplanation: 'Exact keyword match awards 20 pts; partial words award 10 pts.',
      },
      hashtags: {
        name: 'Hashtag Score',
        key: 'hashtags',
        score: hashtagRes.score,
        maxScore: 15,
        status: hashtagRes.score === 15 ? 'passed' : hashtagRes.score === 8 ? 'warning' : 'failed',
        details: hashtagRes.details,
        ruleExplanation: `Counts hashtag density based on ${platform} platform guidelines.`,
      },
      readability: {
        name: 'Readability',
        key: 'readability',
        score: readabilityRes.score,
        maxScore: 10,
        status: readabilityRes.score >= 8 ? 'passed' : readabilityRes.score >= 4 ? 'warning' : 'failed',
        details: readabilityRes.details,
        ruleExplanation: 'Starts at 10 pts: -2 for sentence > 30 words, -2 for excessive caps, -2 for >3 exclamation marks.',
      },
      objectiveMatch: {
        name: 'Content Objective Match',
        key: 'objective',
        score: objectiveRes.score,
        maxScore: 15,
        status: objectiveRes.score === 15 ? 'passed' : objectiveRes.score === 8 ? 'warning' : 'failed',
        details: objectiveRes.details,
        ruleExplanation: `Checks alignment with "${objective}" marketing keywords (≥2 words = 15 pts; 1 word = 8 pts).`,
      },
    },
    recommendations,
  };
}
