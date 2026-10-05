import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initDb,
  getAllCampaigns,
  getCampaignById,
  insertCampaign,
  updateCampaign,
  deleteCampaign,
  getAllPosts,
  getPostById,
  insertPost,
  updatePost,
  deletePost,
  schedulePost,
  publishPost,
  getAllUsers,
  getUserByEmail,
  createUser,
  getSettings,
  saveSettings,
  resetDatabase,
} from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize SQLite database
  initDb();

  // Initialize Gemini API if key is present
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Could not initialize GoogleGenAI with key:', e);
    }
  }

  // AI Content Generation endpoint
  app.post('/api/generate-content', async (req, res) => {
    try {
      const {
        prompt,
        topic = 'High Altitude Safety Protocol',
        productService = 'High Altitude Safety',
        campaignName = 'Autumn Trekking Safety Drive',
        category = 'Trekking Safety',
        platform = 'Instagram',
        tone = 'Authoritative & Inspiring',
        targetAudience = 'International Trekkers',
        primaryKeyword = 'high altitude safety',
        objective = 'Education',
        keyRequirements = 'Include emergency hotline +977-1-4412345, AMS warning, and acclimatization guidance',
      } = req.body || {};

      if (ai) {
        try {
          const systemInstruction = `You are the Lead Digital Content Strategist for Himalayan Guardian Nepal (HGN / CTG), an elite organization dedicated to adventure safety, emergency rescue coordination, tourism protection, and sustainable trekking in Nepal (Everest, Annapurna, Langtang, Manaslu).
Create professional, authentic, highly engaging marketing content specifically designed for Himalayan Guardian Nepal.
Ensure the post:
1. Naturally integrates the specified Primary SEO Keyword ("${primaryKeyword}").
2. Accurately highlights the chosen Product / Service ("${productService}").
3. Tailors language and messaging to the Target Audience ("${targetAudience}").
4. Advances the selected Campaign Objective ("${objective}").
5. Maintains Himalayan safety context (AMS prevention, acclimatization days, TIMS permits, travel insurance with helicopter evacuation coverage, certified guide requirements, emergency dispatch hotline +977-1-4412345).
6. Mentions Himalayan Guardian Nepal (or HGN / CTG) and includes a clear Call to Action (such as "learn more", "travel prepared", "contact us", "explore", or "visit").
Always return strict JSON.`;

          const promptText = `Generate marketing content for:
Product / Service: ${productService}
Content Category: ${category}
Topic: ${topic}
Primary SEO Keyword: ${primaryKeyword}
Campaign Objective: ${objective}
Target Audience: ${targetAudience}
Campaign: ${campaignName}
Platform: ${platform}
Tone: ${tone}
Specific Requirements: ${keyRequirements}
User Guidelines: ${prompt || 'Focus on actionable safety insights that build confidence and brand authority.'}

Respond with a JSON object in this exact structure:
{
  "title": "Catchy post title or headline",
  "content": "Full post body written specifically for ${platform} with proper formatting and line breaks, including the primary keyword '${primaryKeyword}', the product '${productService}', and brand mention 'Himalayan Guardian Nepal'",
  "hashtags": ["#HimalayanGuardian", "#NepalSafety", "#TrekNepal", ...at least 5 relevant hashtags],
  "callToAction": "Clear call to action string (e.g. 'Learn more and travel prepared with Himalayan Guardian Nepal.')",
  "visualPrompt": "Detailed creative direction for photography / graphic asset",
  "platformTips": "Recommended posting time and channel engagement strategy"
}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: promptText,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: 'application/json',
            },
          });

          const text = response.text?.trim() || '';
          if (text) {
            try {
              const data = JSON.parse(text);
              return res.json({ success: true, data, source: 'gemini-3.8-flash' });
            } catch (pErr) {
              console.warn('JSON parsing fallback:', pErr);
            }
          }
        } catch (geminiErr) {
          console.warn('Gemini API call failed, falling back to local engine:', geminiErr);
        }
      }

      // Robust fallback generator if AI key not provided or network issue
      const fallbackData = generateFallbackContent({
        topic,
        campaignName,
        platform,
        tone,
        targetAudience,
        keyRequirements,
        prompt,
      });

      return res.json({ success: true, data: fallbackData, source: 'himalayan-knowledge-engine' });
    } catch (err: any) {
      console.error('Server error in /api/generate-content:', err);
      const fallbackData = generateFallbackContent(req.body || {});
      return res.json({ success: true, data: fallbackData, source: 'resilient-fallback' });
    }
  });

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      organization: 'Himalayan Guardian Nepal',
      geminiActive: !!ai,
      model: 'gemini-3.8-flash',
      database: 'SQLite (data/hgn.db)',
      timestamp: new Date().toISOString(),
    });
  });

  // ---------------------------------------------------------------------------
  // REST API: Campaigns (SQLite)
  // ---------------------------------------------------------------------------
  app.get('/api/campaigns', (_req, res) => {
    try {
      const campaigns = getAllCampaigns();
      res.json({ success: true, data: campaigns });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/campaigns/:id', (req, res) => {
    try {
      const campaign = getCampaignById(req.params.id);
      if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' });
      res.json({ success: true, data: campaign });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/campaigns', (req, res) => {
    try {
      const c = req.body;
      if (!c.id) c.id = `camp-${Date.now()}`;
      const created = insertCampaign(c);
      res.status(201).json({ success: true, data: created });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put('/api/campaigns/:id', (req, res) => {
    try {
      const updated = updateCampaign(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'Campaign not found' });
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete('/api/campaigns/:id', (req, res) => {
    try {
      deleteCampaign(req.params.id);
      res.json({ success: true, message: 'Campaign deleted' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ---------------------------------------------------------------------------
  // REST API: Posts / Content (SQLite)
  // ---------------------------------------------------------------------------
  app.get('/api/posts', (_req, res) => {
    try {
      const posts = getAllPosts();
      res.json({ success: true, data: posts });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get('/api/posts/:id', (req, res) => {
    try {
      const post = getPostById(req.params.id);
      if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
      res.json({ success: true, data: post });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/posts', (req, res) => {
    try {
      const p = req.body;
      if (!p.id) p.id = `post-${Date.now()}`;
      const created = insertPost(p);
      res.status(201).json({ success: true, data: created });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put('/api/posts/:id', (req, res) => {
    try {
      const updated = updatePost(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'Post not found' });
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.delete('/api/posts/:id', (req, res) => {
    try {
      deletePost(req.params.id);
      res.json({ success: true, message: 'Post deleted' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/posts/:id/schedule', (req, res) => {
    try {
      const { scheduledFor } = req.body;
      const updated = schedulePost(req.params.id, scheduledFor);
      if (!updated) return res.status(404).json({ success: false, error: 'Post not found' });
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/posts/:id/publish', (req, res) => {
    try {
      const updated = publishPost(req.params.id);
      if (!updated) return res.status(404).json({ success: false, error: 'Post not found' });
      res.json({ success: true, data: updated });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ---------------------------------------------------------------------------
  // REST API: Authentication & Users (SQLite)
  // ---------------------------------------------------------------------------
  app.get('/api/users', (_req, res) => {
    try {
      const users = getAllUsers();
      res.json({ success: true, data: users });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body;
      if (!name?.trim() || !email?.trim() || !password?.trim()) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
      }
      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ success: false, error: 'Passwords do not match' });
      }
      const existing = getUserByEmail(email.trim());
      if (existing) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists' });
      }
      const created = createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      res.status(201).json({ success: true, user: created });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email?.trim() || !password?.trim()) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }
      const user = getUserByEmail(email.trim());
      if (!user || user.password !== password.trim()) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
      const userSession = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
      };
      res.json({ success: true, user: userSession });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ---------------------------------------------------------------------------
  // REST API: Settings & Database Reset (SQLite)
  // ---------------------------------------------------------------------------
  app.get('/api/settings', (_req, res) => {
    try {
      const settings = getSettings();
      res.json({ success: true, data: settings });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.put('/api/settings', (req, res) => {
    try {
      saveSettings(req.body);
      res.json({ success: true, message: 'Settings saved' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/settings/reset', (_req, res) => {
    try {
      resetDatabase();
      res.json({ success: true, message: 'Database reset to default seed data' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Connect Vite in development or serve static in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Himalayan Guardian] Server running on port ${PORT}`);
  });
}

function generateFallbackContent(params: any) {
  const { topic = 'Altitude Sickness Prevention', platform = 'Instagram', tone = 'Authoritative' } = params;

  if (platform === 'Instagram') {
    return {
      title: '🏔️ The Golden Rule Above 3,000 Meters: Acclimatize to Survive',
      content: `Planning your trek across the high passes of Nepal? The Himalayas will test your endurance, but altitude respects only preparation.\n\n⚠️ Acute Mountain Sickness (AMS) is preventable if you honor standard acclimatization intervals:\n1️⃣ Climb high, sleep low: Rest days at Namche Bazaar (3,440m) and Dingboche (4,410m) are not optional.\n2️⃣ Maximum ascent of 300-500m per day once above 3,000m.\n3️⃣ Drink 4-5 liters of clean water daily with electrolyte balance.\n4️⃣ Never hide headaches, dizziness, or loss of appetite from your guide.\n\nAt Himalayan Guardian Nepal, our rapid medical dispatch and satellite-tracked emergency teams monitor trail weather 24/7 across Khumbu, Annapurna, and Manaslu.\n\n📞 24/7 Himalayan SOS Hotline: +977-1-4412345 | Satellite Dispatch: +977-9801234567\n🛡️ Verified Emergency Helicopter Evacuation Insurance is mandatory for all high-altitude routes.`,
      hashtags: ['#HimalayanGuardian', '#NepalTrekkingSafety', '#EverestBaseCamp', '#AnnapurnaCircuit', '#HighAltitudeSafety', '#TrekSafeNepal', '#EmergencyRescueNepal'],
      callToAction: 'Save this protocol for your offline trek pack and share it with your trekking partner. Safe trails, guardians!',
      visualPrompt: 'Dramatic golden-hour photograph of a trekker with trekking poles overlooking the Ama Dablam peak, wearing high-visibility safety mountain gear with safety beacon.',
      platformTips: 'Post with high-contrast carousel slides breaking down AMS symptoms. Optimal time: 6:00 PM NPT (morning Europe, early morning Americas).',
    };
  }

  if (platform === 'LinkedIn') {
    return {
      title: 'Risk Governance in High-Altitude Adventure Tourism: Himalayan Guardian Protocol 2026',
      content: `As Nepal enters peak trekking season, tourism operators, expedition leaders, and international insurers face an evolving safety landscape.\n\nHimalayan Guardian Nepal announces its updated 2026 Adventure Risk Mitigation Guidelines for commercial outfitters across the Solukhumbu and Gandaki zones.\n\nKey Operational Priorities:\n• Standardized Pre-Ascent Pulse Oximeter Monitoring at mandatory checkposts.\n• Verified satellite comms integration for isolated corridors (Thorong La, Larkya La, Cho La).\n• Direct coordination with the Civil Aviation Authority of Nepal (CAAN) and accredited high-altitude helicopter rescue providers to eliminate fraudulent distress calls.\n• Mandatory verification of comprehensive medical evacuation insurance prior to TIMS permit clearance.\n\nSustainable Himalayan tourism begins with uncompromised safety architecture.\n\nFor enterprise partnership inquiries or expedition tracking registration: operations@himalayanguardian.org.np\nEmergency Line: +977-1-4412345`,
      hashtags: ['#HimalayanGuardian', '#TourismSafetyNepal', '#RiskManagement', '#ExpeditionLogistics', '#NepalTourism2026', '#AdventureProtection'],
      callToAction: 'Connect with our operations team to integrate the Himalayan Guardian Safety Protocol into your agency roster.',
      visualPrompt: 'Clean corporate-style infographic showing the 4-tier emergency response workflow from satellite beacon to Kathmandu tertiary hospital.',
      platformTips: 'Best published on Tuesday or Wednesday morning between 8:30 AM - 11:00 AM NPT.',
    };
  }

  if (platform === 'Twitter' || platform === 'X') {
    return {
      title: '🚨 WEATHER ADVISORY: High Passes Notice',
      content: `🚨 ALERT: Unseasonal westerly depression approaching Thorong La & Larkya La passes over the next 48 hours.\n\n• Wind chill dipping below -18°C\n• Micro-spikes & thermal gear mandatory\n• Report check-in to local police post\n\nHimalayan SOS: +977-1-4412345\n\n#NepalSafety #TrekNepal`,
      hashtags: ['#NepalSafety', '#HimalayanGuardian', '#TrekNepal', '#MountainAlert'],
      callToAction: 'Retweet to inform all active trekking groups currently on trail.',
      visualPrompt: 'Live satellite weather radar map showing isobar fronts over western Nepal Himalayas.',
      platformTips: 'Post immediately with high urgency tag.',
    };
  }

  // Default Facebook / Blog
  return {
    title: 'Essential Safety Checklist for Autumn Trekking in Nepal',
    content: `Heading to the Himalayas this season? Whether you are trekking to Annapurna Base Camp, Gokyo Lakes, or the pristine trails of Langtang, your safety is Himalayan Guardian Nepal’s highest priority.\n\nHere is your official 5-point safety check:\n1. ACCOMMODATION & ACCLIMATIZATION: Never push through symptoms of altitude sickness. Descent is the only cure.\n2. CERTIFIED GUIDES ONLY: Always trek with government-licensed guides registered with TAAN.\n3. PERMITS & TIMS: Ensure your Trekker Information Management System card is active.\n4. EMERGENCY HELI INSURANCE: Confirm your policy covers emergency medical evacuation up to 6,000 meters without deductible delays.\n5. GUARDIAN SOS APP: Download our offline emergency grid map before departing Kathmandu or Pokhara.\n\nEmergency 24/7 Helpline: +977-1-4412345\nWebsite: www.himalayanguardian.org.np`,
    hashtags: ['#HimalayanGuardian', '#NepalTravelSafety', '#TrekNepal', '#VisitNepal', '#ResponsibleTourism'],
    callToAction: 'Tag a friend who is trekking to Nepal this year and bookmark this checklist!',
    visualPrompt: 'Vibrant scenic photo of Annapurna South with prayer flags flapping in foreground and well-equipped trekkers hiking safely.',
    platformTips: 'Boost as a pinned post on Facebook page targeting international travel groups.',
  };
}

startServer();
