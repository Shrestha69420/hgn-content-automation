import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Campaign,
  ContentPost,
  ContentQualityReport,
  Platform,
  UserProfile,
  UserRole,
  MarketingAnalyticsOverview
} from '../types';
import {
  INITIAL_CAMPAIGNS,
  INITIAL_POSTS,
  INITIAL_USERS,
  INITIAL_ANALYTICS,
} from '../lib/initialData';
import { evaluateContentQuality } from '../lib/qualityScoringEngine';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';

export type ActiveModule =
  | 'dashboard'
  | 'campaigns'
  | 'generator'
  | 'quality-score'
  | 'library'
  | 'calendar'
  | 'analytics'
  | 'settings';

interface AppContextType {
  activeModule: ActiveModule;
  setActiveModule: (mod: ActiveModule) => void;
  currentUser: UserProfile;
  switchUser: (role: UserRole) => void;
  users: UserProfile[];
  
  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id'>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;

  // Posts / Content Library
  posts: ContentPost[];
  activePost: ContentPost | null;
  setActivePost: (post: ContentPost | null) => void;
  addPost: (post: Omit<ContentPost, 'id' | 'createdAt' | 'qualityReport'>) => ContentPost;
  updatePost: (id: string, updates: Partial<ContentPost>) => void;
  deletePost: (id: string) => void;
  schedulePost: (id: string, scheduledFor: string) => void;
  publishPostNow: (id: string) => void;

  // Content Quality Scoring state & workflow
  activeEvaluationReport: ContentQualityReport | null;
  evaluatePostContent: (content: string, platform: Platform, hashtags?: string[], cta?: string) => ContentQualityReport;
  
  // Draft being transferred between Generator and Quality Scorer
  workingDraft: {
    title: string;
    content: string;
    platform: Platform;
    hashtags: string[];
    callToAction: string;
    campaignId: string;
    campaignName: string;
    visualPrompt?: string;
    primaryKeyword?: string;
    objective?: string;
  };
  setWorkingDraft: React.Dispatch<React.SetStateAction<any>>;
  transferToQualityScorer: (draft: any) => void;

  // Analytics
  analytics: MarketingAnalyticsOverview;

  // Toasts
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_POSTS = 'hg_nepal_posts_v2';
const STORAGE_KEY_CAMPAIGNS = 'hg_nepal_campaigns_v2';
const STORAGE_KEY_USER = 'hg_nepal_active_user_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser: authUser } = useAuth();
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [users] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(authUser || INITIAL_USERS[0]);

  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [authUser]);

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CAMPAIGNS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CAMPAIGNS;
  });

  const [posts, setPosts] = useState<ContentPost[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_POSTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_POSTS;
  });

  const [activePost, setActivePost] = useState<ContentPost | null>(null);
  const [activeEvaluationReport, setActiveEvaluationReport] = useState<ContentQualityReport | null>(null);
  const [analytics] = useState<MarketingAnalyticsOverview>(INITIAL_ANALYTICS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Transferable draft
  const [workingDraft, setWorkingDraft] = useState({
    title: 'High Altitude Acclimatization Notice',
    content: `Heading above Namche Bazaar (3,440m)? Remember the golden rule: Never climb higher if you exhibit symptoms of AMS.\n\n• Rest at Dingboche before ascending to Lobuche.\n• Stay hydrated with 4L of warm fluids.\n• Carry pulse oximeter for daily oxygen saturation checks.\n\n24/7 Himalayan SOS Hotline: +977-1-4412345\nTourist Police: 1144`,
    platform: 'Instagram' as Platform,
    hashtags: ['#HimalayanGuardian', '#NepalTrekkingSafety', '#EverestSafety', '#HighAltitudeSafety'],
    callToAction: 'Save this post and share with your trekking expedition team.',
    campaignId: 'camp-ebc-2026',
    campaignName: 'Spring 2026 Everest Safety & Acclimatization Drive',
    visualPrompt: 'High elevation trail with snow peaks and colourful Buddhist prayer flags.',
    primaryKeyword: 'high altitude safety',
    objective: 'Education',
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CAMPAIGNS, JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, currentUser.id);
  }, [currentUser]);

  // Initial load: Fetch directly from SQLite backend
  useEffect(() => {
    apiService.getCampaigns()
      .then(serverCampaigns => {
        if (Array.isArray(serverCampaigns) && serverCampaigns.length > 0) {
          setCampaigns(serverCampaigns);
        }
      })
      .catch(err => {
        console.warn('[AppContext] Could not fetch campaigns from SQLite server:', err);
      });

    apiService.getPosts()
      .then(serverPosts => {
        if (Array.isArray(serverPosts) && serverPosts.length > 0) {
          setPosts(serverPosts);
        }
      })
      .catch(err => {
        console.warn('[AppContext] Could not fetch posts from SQLite server:', err);
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const switchUser = (role: UserRole) => {
    const user = users.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      showToast(`Switched active profile to ${user.name} (${user.role})`);
    }
  };

  const addCampaign = (campaignData: Omit<Campaign, 'id'>) => {
    const newCamp: Campaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
    };
    setCampaigns(prev => [newCamp, ...prev]);
    showToast(`Campaign "${newCamp.name}" successfully created!`);
    apiService.createCampaign(newCamp).catch(err => {
      console.warn('Could not persist new campaign to SQLite server:', err);
    });
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Campaign updated successfully.');
    apiService.updateCampaign(id, updates).catch(err => {
      console.warn('Could not persist updated campaign to SQLite server:', err);
    });
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    showToast('Campaign archived.');
    apiService.deleteCampaign(id).catch(err => {
      console.warn('Could not delete campaign on SQLite server:', err);
    });
  };

  const evaluatePostContent = (
    content: string,
    platform: Platform,
    hashtags: string[] = [],
    cta: string = ''
  ): ContentQualityReport => {
    const report = evaluateContentQuality(content, platform, hashtags, cta);
    setActiveEvaluationReport(report);
    return report;
  };

  const addPost = (postData: Omit<ContentPost, 'id' | 'createdAt' | 'qualityReport'>): ContentPost => {
    const report = evaluateContentQuality(
      postData.content,
      postData.platform,
      postData.hashtags,
      postData.callToAction
    );

    const newPost: ContentPost = {
      ...postData,
      id: `post-hg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      qualityReport: report,
      versionHistory: [
        {
          timestamp: new Date().toISOString(),
          score: report.overallScore,
          editor: currentUser.name,
          summary: 'Created and evaluated with Deterministic Quality Engine',
        },
      ],
    };

    setPosts(prev => [newPost, ...prev]);
    showToast(`Content saved to Library! Quality Score: ${report.overallScore}/100 (${report.letterGrade})`);
    apiService.createPost(newPost).catch(err => {
      console.warn('Could not persist new post to SQLite server:', err);
    });
    return newPost;
  };

  const updatePost = (id: string, updates: Partial<ContentPost>) => {
    let updatedPostToSave: ContentPost | null = null;
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };
        if (updates.content || updates.platform || updates.hashtags || updates.callToAction) {
          const newReport = evaluateContentQuality(
            updated.content,
            updated.platform,
            updated.hashtags,
            updated.callToAction
          );
          updated.qualityReport = newReport;
          const currentHist = updated.versionHistory || [];
          updated.versionHistory = [
            ...currentHist,
            {
              timestamp: new Date().toISOString(),
              score: newReport.overallScore,
              editor: currentUser.name,
              summary: 'Edited and re-evaluated by deterministic rules',
            },
          ];
        }
        updatedPostToSave = updated;
        return updated;
      })
    );
    showToast('Post updated and re-evaluated.');
    if (updatedPostToSave) {
      apiService.updatePost(id, updatedPostToSave).catch(err => {
        console.warn('Could not persist updated post to SQLite server:', err);
      });
    }
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    showToast('Post removed from Library.');
    apiService.deletePost(id).catch(err => {
      console.warn('Could not delete post on SQLite server:', err);
    });
  };

  const schedulePost = (id: string, scheduledFor: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status: 'Scheduled',
              scheduledFor,
            }
          : p
      )
    );
    showToast(`Post scheduled for ${new Date(scheduledFor).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
    apiService.schedulePost(id, scheduledFor).catch(err => {
      console.warn('Could not schedule post on SQLite server:', err);
    });
  };

  const publishPostNow = (id: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status: 'Published',
              publishedAt: new Date().toISOString(),
            }
          : p
      )
    );
    showToast('Content marked as published to live channel!');
    apiService.publishPost(id).catch(err => {
      console.warn('Could not publish post on SQLite server:', err);
    });
  };

  const transferToQualityScorer = (draft: any) => {
    setWorkingDraft(draft);
    evaluatePostContent(draft.content, draft.platform, draft.hashtags, draft.callToAction);
    setActiveModule('quality-score');
    showToast('Draft routed to Deterministic Content Quality Evaluator.');
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        currentUser,
        switchUser,
        users,
        campaigns,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        posts,
        activePost,
        setActivePost,
        addPost,
        updatePost,
        deletePost,
        schedulePost,
        publishPostNow,
        activeEvaluationReport,
        evaluatePostContent,
        workingDraft,
        setWorkingDraft,
        transferToQualityScorer,
        analytics,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
