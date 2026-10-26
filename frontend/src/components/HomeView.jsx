import React from 'react';
import heroImage from '../assets/hero.png';
import {
  AppleIcon,
  LeafIcon,
  ShieldCheckIcon,
  UtensilsIcon,
  CalendarIcon,
  SparklesIcon,
  ChevronRightIcon,
  CheckCircleIcon
} from './Icons';

export default function HomeView({ onSelectTab }) {
  const modules = [
    {
      id: 'nutrition',
      title: 'Nutrition & Calories',
      badge: 'Vision AI • Macro Scanner',
      icon: AppleIcon,
      accentColor: 'text-forest',
      bgBadge: 'badge-mint',
      description: 'Upload meal photos to detect items, calculate calorie counts, and break down protein, carbs, and fats in seconds.',
      actionText: 'Launch Nutrition Scanner',
    },
    {
      id: 'freshness',
      title: 'Freshness & Spoilage',
      badge: 'Produce Inspector • Safety Guard',
      icon: LeafIcon,
      accentColor: 'text-emerald',
      bgBadge: 'badge-emerald',
      description: 'Inspect fruits, veggies, and pantry items for visible aging, wilting, bruising, and recommended shelf-life limits.',
      actionText: 'Inspect Freshness',
    },
    {
      id: 'hygiene',
      title: 'Restaurant Hygiene',
      badge: 'Sanitation Audit • Safety',
      icon: ShieldCheckIcon,
      accentColor: 'text-forest',
      bgBadge: 'badge-forest',
      description: 'Audit dining areas, buffet setups, and food preparation counters for visible cleanliness and safe food handling.',
      actionText: 'Audit Restaurant Hygiene',
    },
    {
      id: 'cooking',
      title: 'Smart Cooking Assistant',
      badge: 'Pantry-to-Plate • Chef AI',
      icon: UtensilsIcon,
      accentColor: 'text-amber',
      bgBadge: 'badge-amber',
      description: 'Turn ingredients in your fridge or pantry into delicious, customized recipes with clear step-by-step instructions.',
      actionText: 'Create Custom Recipe',
    },
    {
      id: 'meal-planner',
      title: 'Personalized Meal Planner',
      badge: 'Adaptive Nutrition • Weekly Architect',
      icon: CalendarIcon,
      accentColor: 'text-forest',
      bgBadge: 'badge-mint',
      description: 'Construct balanced multi-day meal architectures aligned with your health goals, complete with interactive grocery checklists.',
      actionText: 'Generate Meal Plan',
    },
  ];

  const benefits = [
    {
      title: 'Multimodal Cloud Vision',
      description: 'Recognizes diverse cuisines, ingredient varieties, and surface conditions accurately through advanced vision models.',
    },
    {
      title: 'Ultra-Fast LPU Engine',
      description: 'Powered by high-throughput Groq cloud inference with sub-second text and image processing speeds.',
    },
    {
      title: 'Proactive Food Safety',
      description: 'Spot early spoilage indicators and dining sanitation risks before they affect your wellbeing.',
    },
    {
      title: 'Tailored Culinary Intelligence',
      description: 'Personalized recommendations that respect your specific dietary restrictions, allergies, and calorie goals.',
    },
  ];

  return (
    <div className="home-dashboard">
      {/* Welcoming Hero Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge">
            <SparklesIcon className="w-4 h-4 text-emerald" />
            <span>Multimodal Food Intelligence Agent</span>
          </div>
          <h1 className="hero-title">
            Smart Culinary & Wellness Intelligence for Every Meal
          </h1>
          <p className="hero-description">
            Experience real-time AI food recognition, spoilage detection, dining sanitation audits,
            and chef-crafted meal planning—tailored to your nutritional lifestyle.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary hero-btn"
              onClick={() => onSelectTab('nutrition')}
            >
              <AppleIcon className="w-4 h-4" />
              <span>Scan Nutrition</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary hero-btn"
              onClick={() => onSelectTab('cooking')}
            >
              <UtensilsIcon className="w-4 h-4" />
              <span>Explore Cooking</span>
            </button>
          </div>

          <div className="hero-feature-tags">
            <span className="hero-tag">
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald" /> Groq Vision 27B
            </span>
            <span className="hero-tag">
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald" /> Zero GPU Required
            </span>
            <span className="hero-tag">
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald" /> 5 Multimodal Modules
            </span>
          </div>
        </div>

        <div className="hero-image-container">
          <div className="hero-image-card">
            <img
              src={heroImage}
              alt="Healthy culinary bowl with fresh greens and wholesome ingredients"
              className="hero-image"
            />
            <div className="hero-image-floating-badge">
              <div className="floating-badge-icon">
                <AppleIcon className="w-5 h-5 text-forest" />
              </div>
              <div className="floating-badge-text">
                <strong>Nutrient Scanner</strong>
                <span>Instant visual calorie & macro estimation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Module Quick Launch Grid */}
      <section className="modules-directory-section">
        <div className="section-header-compact">
          <h2 className="section-title-compact">Explore Food Intelligence Modules</h2>
          <span className="section-subtitle-compact">Five specialized agents for comprehensive food analysis & planning</span>
        </div>

        <div className="module-cards-grid">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className="dashboard-module-card"
                onClick={() => onSelectTab(mod.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectTab(mod.id)}
              >
                <div className="dmc-top">
                  <div className={`dmc-icon-badge ${mod.bgBadge}`}>
                    <Icon className={`w-5 h-5 ${mod.accentColor}`} />
                  </div>
                  <span className={`badge-pill ${mod.bgBadge}`}>{mod.badge}</span>
                </div>

                <h3 className="dmc-title">{mod.title}</h3>
                <p className="dmc-desc">{mod.description}</p>

                <div className="dmc-footer">
                  <span className="dmc-action-link">
                    {mod.actionText}
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Strip */}
      <section className="benefits-strip">
        <div className="benefits-header">
          <h3 className="benefits-title">Core Intelligence Pillars</h3>
          <p className="benefits-subtitle">Engineered for accuracy, safety, and everyday culinary empowerment</p>
        </div>
        <div className="benefits-grid">
          {benefits.map((b, idx) => (
            <div key={idx} className="benefit-item">
              <div className="benefit-check-circle">
                <CheckCircleIcon className="w-4 h-4 text-emerald" />
              </div>
              <div className="benefit-content">
                <h4 className="benefit-item-title">{b.title}</h4>
                <p className="benefit-item-desc">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
