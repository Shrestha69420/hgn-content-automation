import { Campaign, ContentPost, UserProfile, MarketingAnalyticsOverview } from '../types';
import { evaluateContentQuality } from './qualityScoringEngine';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-mo-01',
    name: 'Aarav Shrestha',
    email: 'aarav.marketing@himalayanguardian.org.np',
    role: 'Marketing Officer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Digital Marketing & Community',
  },
  {
    id: 'user-cs-02',
    name: 'Tenzing N. Sherpa',
    email: 'tenzing.content@himalayanguardian.org.np',
    role: 'Content Strategist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Editorial & International Outreach',
  },
  {
    id: 'user-sd-03',
    name: 'Dr. Pasang Dolma',
    email: 'pasang.safety@himalayanguardian.org.np',
    role: 'Mountain Safety Director',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'High-Altitude Medical & Rescue Dispatch',
  },
  {
    id: 'user-smp-04',
    name: 'Sita Poudel',
    email: 'sita.social@himalayanguardian.org.np',
    role: 'Social Media Specialist',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'Social Media & Publishing Channels',
  },
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-ebc-2026',
    name: 'Spring 2026 Everest Safety & Acclimatization Drive',
    code: 'HG-EBC-SP26',
    description: 'Promoting life-saving altitude pacing, pulse oximeter checkpoints, and licensed guide verification along the Lukla - Namche - EBC corridor.',
    category: 'Travel Safety',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    season: 'Spring Everest',
    targetAudience: 'International Trekkers, Expedition Leaders, Alpine Tour Operators',
    targetChannels: ['Instagram', 'LinkedIn', 'Facebook'],
    budgetNPR: 450000,
    status: 'Active',
    kpis: {
      targetReach: 250000,
      currentReach: 184200,
      targetEngagement: 18500,
      postsPlanned: 24,
      postsPublished: 16,
    },
    safetyFocus: 'Acute Mountain Sickness (AMS), Gamow Bags, Emergency Satellite SOS Dispatch',
  },
  {
    id: 'camp-heli-rescue',
    name: 'Himalayan Heli-Rescue & Insurance Verification Campaign',
    code: 'HG-RESCUE-01',
    description: 'Educating foreign travelers on mandatory travel insurance with verified helicopter evacuation up to 6,000 meters to stop rescue scams.',
    category: 'Educational Content',
    startDate: '2026-09-15',
    endDate: '2026-11-30',
    season: 'Autumn Peak',
    targetAudience: 'Independent Travelers, Travel Agencies, Insurance Underwriters',
    targetChannels: ['LinkedIn', 'Twitter', 'Blog'],
    budgetNPR: 320000,
    status: 'Active',
    kpis: {
      targetReach: 180000,
      currentReach: 142000,
      targetEngagement: 14200,
      postsPlanned: 18,
      postsPublished: 12,
    },
    safetyFocus: 'Medical Evacuation SOP, CAAN Helicopter Air Clearance, SOS Hotline',
  },
  {
    id: 'camp-annapurna-pass',
    name: 'Thorong La & Annapurna Circuit Weather Awareness',
    code: 'HG-ACT-WT26',
    description: 'Real-time high pass safety alerts, microspike advisories, and avalanche safety warnings for trekkers crossing Thorong La (5,416m).',
    category: 'Emergency Advisory',
    startDate: '2026-10-01',
    endDate: '2026-12-15',
    season: 'Autumn Peak',
    targetAudience: 'Circuit Trekkers, Teahouse Lodge Owners, Local Sherpa Guides',
    targetChannels: ['Instagram', 'Twitter', 'Facebook'],
    budgetNPR: 280000,
    status: 'Active',
    kpis: {
      targetReach: 120000,
      currentReach: 68900,
      targetEngagement: 9400,
      postsPlanned: 15,
      postsPublished: 8,
    },
    safetyFocus: 'Avalanche Advisory, Sub-Zero Hypothermia, High-Pass Route Conditions',
  },
  {
    id: 'camp-eco-guardian',
    name: 'Leave No Trace: Eco-Guardian Himalayan Campaign',
    code: 'HG-ECO-2026',
    description: 'Advocating for plastic-free trails, responsible waste disposal, and ethical compensation for high-altitude porters and Sherpa staff.',
    category: 'Marketing Campaign',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    season: 'Autumn Peak',
    targetAudience: 'Eco-conscious Travelers, Outdoor Brands, Conservation Partners',
    targetChannels: ['Instagram', 'Blog', 'LinkedIn'],
    budgetNPR: 200000,
    status: 'Planning',
    kpis: {
      targetReach: 150000,
      currentReach: 32000,
      targetEngagement: 4800,
      postsPlanned: 12,
      postsPublished: 3,
    },
    safetyFocus: 'Porter Weight Limits (Max 25kg), Trail Cleanliness, Cultural Respect',
  },
];

const post1Content = `Planning your trek across the high passes of Nepal? The Himalayas will test your endurance, but altitude respects only preparation.

⚠️ Acute Mountain Sickness (AMS) is preventable if you honor standard acclimatization intervals:
1️⃣ Climb high, sleep low: Rest days at Namche Bazaar (3,440m) and Dingboche (4,410m) are not optional.
2️⃣ Maximum ascent of 300-500m per day once above 3,000m.
3️⃣ Drink 4-5 liters of clean water daily with electrolyte balance.
4️⃣ Never hide headaches, dizziness, or loss of appetite from your certified guide.

At Himalayan Guardian Nepal, our rapid medical dispatch and satellite-tracked emergency teams monitor trail weather 24/7 across Khumbu, Annapurna, and Manaslu.

📞 24/7 Himalayan SOS Hotline: +977-1-4412345 | Satellite Dispatch: +977-9801234567
🛡️ Verified Emergency Helicopter Evacuation Insurance is mandatory for all high-altitude routes.`;

const post1Hashtags = ['#HimalayanGuardian', '#NepalTrekkingSafety', '#EverestBaseCamp', '#AnnapurnaCircuit', '#HighAltitudeSafety', '#TrekSafeNepal', '#EmergencyRescueNepal'];
const post1Cta = 'Save this protocol for your offline trek pack and share it with your trekking partner. Safe trails, guardians!';

const post2Content = `Risk Governance in High-Altitude Adventure Tourism: Himalayan Guardian Protocol 2026.

As Nepal enters peak autumn trekking season, tourism operators, expedition leaders, and international insurers face an evolving safety landscape.

Himalayan Guardian Nepal announces its updated 2026 Adventure Risk Mitigation Guidelines for commercial outfitters across Solukhumbu and Gandaki zones.

Key Operational Priorities:
• Standardized Pre-Ascent Pulse Oximeter Monitoring at mandatory checkposts.
• Verified satellite comms integration for isolated corridors (Thorong La, Larkya La, Cho La).
• Direct coordination with the Civil Aviation Authority of Nepal (CAAN) and accredited helicopter rescue providers to eliminate fraudulent distress calls.
• Mandatory verification of comprehensive medical evacuation insurance prior to TIMS permit clearance.

Sustainable Himalayan tourism begins with uncompromised safety architecture.

For enterprise partnership inquiries: operations@himalayanguardian.org.np
24/7 Dispatch Hotline: +977-1-4412345`;

const post2Hashtags = ['#HimalayanGuardian', '#TourismSafetyNepal', '#RiskManagement', '#ExpeditionLogistics', '#NepalTourism2026', '#AdventureProtection'];
const post2Cta = 'Connect with our operations team to integrate the Himalayan Guardian Safety Protocol into your agency roster.';

const post3Content = `🚨 CRITICAL WEATHER ADVISORY: High Passes Notice

🚨 ALERT: Unseasonal westerly depression approaching Thorong La & Larkya La passes over next 48 hours.

• Wind chill dipping below -18°C
• Micro-spikes & thermal gear mandatory
• Report check-in to local police post
• Do not attempt crossing solo

Himalayan SOS Hotline: +977-1-4412345
Tourist Police: 1144`;

const post3Hashtags = ['#NepalSafety', '#HimalayanGuardian', '#TrekNepal', '#MountainAlert'];
const post3Cta = 'Retweet to inform all active trekking groups currently on trail.';

const post4Content = `Heading to the Himalayas this season? Whether you are trekking to Annapurna Base Camp, Gokyo Lakes, or the pristine trails of Langtang, your safety is Himalayan Guardian Nepal’s highest priority.

Here is your official 5-point safety check:
1. ACCOMMODATION & ACCLIMATIZATION: Never push through symptoms of altitude sickness. Descent is the only cure.
2. CERTIFIED GUIDES ONLY: Always trek with government-licensed guides registered with TAAN.
3. PERMITS & TIMS: Ensure your Trekker Information Management System card is active.
4. EMERGENCY HELI INSURANCE: Confirm your policy covers emergency medical evacuation up to 6,000 meters without deductible delays.
5. GUARDIAN SOS APP: Download our offline emergency grid map before departing Kathmandu or Pokhara.

Emergency 24/7 Helpline: +977-1-4412345
Tourist Police: 1144`;

const post4Hashtags = ['#HimalayanGuardian', '#NepalTravelSafety', '#TrekNepal', '#VisitNepal', '#ResponsibleTourism'];
const post4Cta = 'Tag a friend who is trekking to Nepal this year and bookmark this checklist!';

export const INITIAL_POSTS: ContentPost[] = [
  {
    id: 'post-hg-001',
    campaignId: 'camp-ebc-2026',
    campaignName: 'Spring 2026 Everest Safety & Acclimatization Drive',
    title: 'The Golden Rule Above 3,000 Meters: Acclimatize to Survive',
    content: post1Content,
    category: 'Travel Safety',
    platform: 'Instagram',
    status: 'Published',
    author: 'Aarav Shrestha',
    createdAt: '2026-09-28T09:30:00Z',
    publishedAt: '2026-09-29T10:15:00Z',
    scheduledFor: '2026-09-29T10:15:00Z',
    hashtags: post1Hashtags,
    callToAction: post1Cta,
    visualPrompt: 'High-contrast golden hour photograph of an equipped trekker standing near Namche Bazaar prayer flags with Everest and Ama Dablam in background.',
    qualityReport: evaluateContentQuality(post1Content, 'Instagram', post1Hashtags, post1Cta),
    analytics: {
      impressions: 48900,
      reach: 34200,
      engagements: 3820,
      shares: 940,
      saves: 1650,
      ctr: 4.8,
    },
    versionHistory: [
      {
        timestamp: '2026-09-28T09:30:00Z',
        score: 84,
        editor: 'Aarav Shrestha',
        summary: 'Initial draft generated from AI Generator with Everest safety template',
      },
      {
        timestamp: '2026-09-28T14:10:00Z',
        score: 96,
        editor: 'Dr. Pasang Dolma',
        summary: 'Added 24/7 emergency dispatch line and verified evacuation terms based on deterministic rule feedback',
      },
    ],
  },
  {
    id: 'post-hg-002',
    campaignId: 'camp-heli-rescue',
    campaignName: 'Himalayan Heli-Rescue & Insurance Verification Campaign',
    title: 'Risk Governance in High-Altitude Adventure Tourism: Protocol 2026',
    content: post2Content,
    category: 'Educational Content',
    platform: 'LinkedIn',
    status: 'Published',
    author: 'Tenzing N. Sherpa',
    createdAt: '2026-09-27T08:00:00Z',
    publishedAt: '2026-09-28T07:30:00Z',
    scheduledFor: '2026-09-28T07:30:00Z',
    hashtags: post2Hashtags,
    callToAction: post2Cta,
    visualPrompt: 'Infographic flowchart showcasing the 4-step emergency medical rescue chain from satellite SOS trigger to Kathmandu hospital landing.',
    qualityReport: evaluateContentQuality(post2Content, 'LinkedIn', post2Hashtags, post2Cta),
    analytics: {
      impressions: 29400,
      reach: 21800,
      engagements: 2340,
      shares: 420,
      saves: 680,
      ctr: 5.6,
    },
    versionHistory: [
      {
        timestamp: '2026-09-27T08:00:00Z',
        score: 91,
        editor: 'Tenzing N. Sherpa',
        summary: 'Targeted B2B safety protocol for tour agencies and insurance underwriters',
      },
    ],
  },
  {
    id: 'post-hg-003',
    campaignId: 'camp-annapurna-pass',
    campaignName: 'Thorong La & Annapurna Circuit Weather Awareness',
    title: 'CRITICAL WEATHER ADVISORY: High Passes Notice',
    content: post3Content,
    category: 'Emergency Advisory',
    platform: 'Twitter',
    status: 'Scheduled',
    author: 'Dr. Pasang Dolma',
    createdAt: '2026-10-01T01:15:00Z',
    scheduledFor: '2026-10-02T06:00:00Z',
    hashtags: post3Hashtags,
    callToAction: post3Cta,
    visualPrompt: 'Satellite weather map with low-pressure front isobars over Manang and Mustang districts.',
    qualityReport: evaluateContentQuality(post3Content, 'Twitter', post3Hashtags, post3Cta),
  },
  {
    id: 'post-hg-004',
    campaignId: 'camp-ebc-2026',
    campaignName: 'Spring 2026 Everest Safety & Acclimatization Drive',
    title: 'Essential 5-Point Safety Checklist for Nepal Trekking',
    content: post4Content,
    category: 'Travel Safety',
    platform: 'Facebook',
    status: 'Approved',
    author: 'Aarav Shrestha',
    createdAt: '2026-09-30T11:45:00Z',
    scheduledFor: '2026-10-04T12:00:00Z',
    hashtags: post4Hashtags,
    callToAction: post4Cta,
    visualPrompt: 'Group of diverse international trekkers with trekking poles and helmets crossing a suspension bridge decorated with colorful prayer flags.',
    qualityReport: evaluateContentQuality(post4Content, 'Facebook', post4Hashtags, post4Cta),
  },
  {
    id: 'post-hg-005',
    campaignId: 'camp-eco-guardian',
    campaignName: 'Leave No Trace: Eco-Guardian Himalayan Campaign',
    title: 'Protecting the Sacred Peaks: The Sherpa Porter Welfare Standard',
    content: `When you embark on a Himalayan expedition, behind every breathtaking panorama is the quiet resilience of local porters and guides.\n\nHimalayan Guardian Nepal introduces the 2026 Fair Porter Code across Khumbu and Langtang:\n• Mandatory 25kg maximum load limit enforced at trail checkpoints.\n• Minimum wage standards with guaranteed winter thermal gear and bivouac shelter.\n• Mandatory mountain medical evacuation coverage for all local staff, equal to foreign clients.\n\nEthical adventure tourism means leaving no human behind.\n\nLearn more: www.himalayanguardian.org.np/fair-trek\nEmergency hotline: +977-1-4412345`,
    category: 'Marketing Campaign',
    platform: 'Instagram',
    status: 'Draft',
    author: 'Tenzing N. Sherpa',
    createdAt: '2026-10-01T02:00:00Z',
    hashtags: ['#HimalayanGuardian', '#EthicalTrek', '#SherpaSupport', '#LeaveNoTraceNepal', '#TrekSafe'],
    callToAction: 'Support verified fair-trade trekking agencies when booking your Nepal trip.',
    visualPrompt: 'Documentary style portrait of a smiling Sherpa guide with a snow-dusted woolen cap holding a mountain safety map.',
    qualityReport: evaluateContentQuality(
      `When you embark on a Himalayan expedition, behind every breathtaking panorama is the quiet resilience of local porters and guides.\n\nHimalayan Guardian Nepal introduces the 2026 Fair Porter Code across Khumbu and Langtang:\n• Mandatory 25kg maximum load limit enforced at trail checkpoints.\n• Minimum wage standards with guaranteed winter thermal gear and bivouac shelter.\n• Mandatory mountain medical evacuation coverage for all local staff, equal to foreign clients.\n\nEthical adventure tourism means leaving no human behind.\n\nLearn more: www.himalayanguardian.org.np/fair-trek\nEmergency hotline: +977-1-4412345`,
      'Instagram',
      ['#HimalayanGuardian', '#EthicalTrek', '#SherpaSupport', '#LeaveNoTraceNepal', '#TrekSafe'],
      'Support verified fair-trade trekking agencies when booking your Nepal trip.'
    ),
  },
];

export const INITIAL_ANALYTICS: MarketingAnalyticsOverview = {
  totalContentCreated: 64,
  scheduledQueueCount: 8,
  avgQualityScore: 88.4,
  totalReachSeason: 412500,
  avgEngagementRate: 6.2,
  safetyAlertsPublished: 19,
  channelPerformance: [
    {
      platform: 'Instagram',
      postsCount: 26,
      totalReach: 198000,
      avgEngagement: 7.4,
      conversionRate: 4.8,
    },
    {
      platform: 'Facebook',
      postsCount: 18,
      totalReach: 112000,
      avgEngagement: 5.1,
      conversionRate: 3.2,
    },
    {
      platform: 'LinkedIn',
      postsCount: 12,
      totalReach: 74500,
      avgEngagement: 6.8,
      conversionRate: 8.1,
    },
    {
      platform: 'Twitter',
      postsCount: 8,
      totalReach: 28000,
      avgEngagement: 5.5,
      conversionRate: 2.4,
    },
  ],
};
