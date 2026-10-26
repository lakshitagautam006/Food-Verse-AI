import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import KeySetupModal from './components/KeySetupModal';
import NutritionModule from './components/NutritionModule';
import FreshnessModule from './components/FreshnessModule';
import HygieneModule from './components/HygieneModule';
import CookingModule from './components/CookingModule';
import MealPlannerModule from './components/MealPlannerModule';
import {
  AppleIcon,
  LeafIcon,
  ShieldCheckIcon,
  UtensilsIcon,
  CalendarIcon,
  HomeIcon,
  XIcon
} from './components/Icons';
import { api } from './api';

const NAV_ITEMS = [
  { id: 'home', label: 'Home Overview', icon: HomeIcon, badge: 'Hub' },
  { id: 'nutrition', label: 'Nutrition & Calories', icon: AppleIcon, badge: 'Vision' },
  { id: 'freshness', label: 'Freshness & Spoilage', icon: LeafIcon, badge: 'Safety' },
  { id: 'hygiene', label: 'Restaurant Hygiene', icon: ShieldCheckIcon, badge: 'Audit' },
  { id: 'cooking', label: 'Smart Cooking', icon: UtensilsIcon, badge: 'Chef AI' },
  { id: 'meal-planner', label: 'Meal Planner', icon: CalendarIcon, badge: 'Plan' },
];

const CORE_SEARCH_ITEMS = [
  {
    id: 'core-nutrition',
    title: 'Nutrition & Calories',
    snippet: 'Recognize food dishes, estimate calories, and analyze protein, carbs, and fat profiles.',
    category: 'Module',
    targetTab: 'nutrition',
    keywords: 'food nutrition calories macros protein carbs fat diet meal recognition scanner calorie tracker portion'
  },
  {
    id: 'core-freshness',
    title: 'Freshness & Spoilage',
    snippet: 'Inspect perishable produce for visible wilting, mold, discoloration, and estimated shelf-life.',
    category: 'Module',
    targetTab: 'freshness',
    keywords: 'freshness produce fruit vegetable spoilage mold shelf-life food safety inspection quality aging leftover'
  },
  {
    id: 'core-hygiene',
    title: 'Restaurant Hygiene',
    snippet: 'Audit dining areas and food prep surfaces for cleanliness scores and sanitation observations.',
    category: 'Module',
    targetTab: 'hygiene',
    keywords: 'restaurant hygiene cleanliness dining audit kitchen sanitation safety inspection score buffet counter'
  },
  {
    id: 'core-cooking',
    title: 'Smart Cooking Assistant',
    snippet: 'Generate chef-crafted recipes from available kitchen ingredients or pantry photos.',
    category: 'Module',
    targetTab: 'cooking',
    keywords: 'cooking recipe chef ingredients pantry fridge meals dinner breakfast lunch instructions zero-waste'
  },
  {
    id: 'core-meal-planner',
    title: 'Personalized Meal Planner',
    snippet: 'Build multi-day meal architectures with macro balancing, prep tips, and grocery checklists.',
    category: 'Module',
    targetTab: 'meal-planner',
    keywords: 'meal planner diet weekly plan grocery checklist calories hypertrophy fat loss vitality nutrition schedule'
  },
  {
    id: 'core-home',
    title: 'Home Overview',
    snippet: 'Main wellness dashboard with health summary metrics and core intelligence pillars.',
    category: 'Module',
    targetTab: 'home',
    keywords: 'home dashboard wellness overview health targets guidelines metrics pillars'
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [health, setHealth] = useState(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('foodverse_theme') || 'light';
    } catch {
      return 'light';
    }
  });

  // Notifications state
  const [notifications, setNotifications] = useState([]);

  // Search state & dynamic search index
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionSearchItems, setSessionSearchItems] = useState([]);

  const fetchHealthStatus = async () => {
    try {
      const data = await api.checkHealth();
      setHealth(data);
    } catch {
      setHealth({
        status: 'offline',
        api_key_configured: false,
        model: 'qwen/qwen3.8-27b',
        message: 'Backend server is unreachable.'
      });
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  // Sync data-theme attribute and theme-dark class on <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('foodverse_theme', nextTheme);
    } catch {
      // Ignore storage errors in restricted iframe
    }
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.documentElement.classList.toggle('theme-dark', nextTheme === 'dark');
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Close mobile drawer if open
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Notification actions
  const addNotification = (notif) => {
    const newEntry = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date(),
      read: false,
      ...notif,
    };
    setNotifications((prev) => [newEntry, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleSelectNotification = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.targetTab) {
      handleSelectTab(notif.targetTab);
    }
  };

  // Search indexing
  const handleDataAnalyzed = (type, item) => {
    setSessionSearchItems((prev) => [
      item,
      ...prev.filter((existing) => existing.id !== item.id),
    ].slice(0, 25));
  };

  const filteredSearchResults = (() => {
    if (!searchQuery || !searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    const allSearchable = [...sessionSearchItems, ...CORE_SEARCH_ITEMS];
    return allSearchable.filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(q);
      const snippetMatch = item.snippet?.toLowerCase().includes(q);
      const categoryMatch = item.category?.toLowerCase().includes(q);
      const keywordsMatch = item.keywords?.toLowerCase().includes(q);
      return titleMatch || snippetMatch || categoryMatch || keywordsMatch;
    });
  })();

  const handleSelectSearchResult = (item) => {
    setSearchQuery('');
    if (item.targetTab) {
      handleSelectTab(item.targetTab);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={`dashboard-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slim Left Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand" onClick={() => handleSelectTab('home')} role="button" tabIndex={0}>
            <div className="brand-logo-badge">
              <AppleIcon className="w-5 h-5 text-white" />
            </div>
            <div className="brand-titles">
              <span className="brand-name">Food Verse AI</span>
              <span className="brand-tagline">Multimodal Agent</span>
            </div>
          </div>
          {sidebarOpen && (
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard Navigation">
          <div className="sidebar-nav-section-label">MAIN NAVIGATION</div>
          <ul className="sidebar-menu">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectTab(item.id)}
                  >
                    <div className="nav-item-icon">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="nav-item-label">{item.label}</span>
                    {item.badge && (
                      <span className={`nav-item-badge ${isActive ? 'badge-active' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Dashboard Layout */}
      <div className="dashboard-main-area">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
          searchQuery={searchQuery}
          onSearch={(q) => setSearchQuery(q)}
          searchResults={filteredSearchResults}
          onSelectSearchResult={handleSelectSearchResult}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllNotificationsRead={markAllNotificationsRead}
          onClearNotifications={clearNotifications}
          onDismissNotification={dismissNotification}
          onSelectNotification={handleSelectNotification}
        />

        {/* Dynamic View Router */}
        <main className="dashboard-content">
          {activeTab === 'home' && (
            <HomeView onSelectTab={handleSelectTab} />
          )}
          {activeTab === 'nutrition' && (
            <NutritionModule
              onOpenKeyModal={() => setIsKeyModalOpen(true)}
              onNotify={addNotification}
              onDataAnalyzed={handleDataAnalyzed}
            />
          )}
          {activeTab === 'freshness' && (
            <FreshnessModule
              onOpenKeyModal={() => setIsKeyModalOpen(true)}
              onNotify={addNotification}
              onDataAnalyzed={handleDataAnalyzed}
            />
          )}
          {activeTab === 'hygiene' && (
            <HygieneModule
              onOpenKeyModal={() => setIsKeyModalOpen(true)}
              onNotify={addNotification}
              onDataAnalyzed={handleDataAnalyzed}
            />
          )}
          {activeTab === 'cooking' && (
            <CookingModule
              onOpenKeyModal={() => setIsKeyModalOpen(true)}
              onNotify={addNotification}
              onDataAnalyzed={handleDataAnalyzed}
            />
          )}
          {activeTab === 'meal-planner' && (
            <MealPlannerModule
              onOpenKeyModal={() => setIsKeyModalOpen(true)}
              onNotify={addNotification}
              onDataAnalyzed={handleDataAnalyzed}
            />
          )}
        </main>

        {/* Clean Dashboard Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <span className="footer-title">Food Verse AI</span>
            <span className="footer-sep">•</span>
            <span className="footer-desc">Multimodal Food Intelligence</span>
          </div>
        </footer>
      </div>

      {/* API Key Setup Modal */}
      <KeySetupModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onStatusUpdated={(newHealth) => setHealth(newHealth)}
        currentHealth={health}
      />
    </div>
  );
}
