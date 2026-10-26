import React, { useState, useRef, useEffect } from 'react';
import {
  SearchIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ChevronRightIcon
} from './Icons';

export default function Header({
  onToggleSidebar,
  theme = 'light',
  onToggleTheme,
  searchQuery = '',
  onSearch,
  searchResults = [],
  onSelectSearchResult,
  notifications = [],
  unreadCount = 0,
  onMarkAllNotificationsRead,
  onClearNotifications,
  onDismissNotification,
  onSelectNotification
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const notifContainerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    onSearch?.(val);
    setIsSearchOpen(val.trim().length > 0);
  };

  const handleClearSearch = () => {
    onSearch?.('');
    setIsSearchOpen(false);
  };

  const handleSelectResult = (item) => {
    setIsSearchOpen(false);
    onSelectSearchResult?.(item);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div className="header-search-container" ref={searchContainerRef}>
          <SearchIcon className="w-4 h-4 header-search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search modules, recipes, nutrition..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setIsSearchOpen(true);
            }}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {isSearchOpen && (
            <div className="search-dropdown-menu">
              <div className="search-dropdown-header">
                <span>Search Results ({searchResults.length})</span>
                <span className="search-hint">Click result to open</span>
              </div>
              <div className="search-results-list">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="search-result-item"
                      onClick={() => handleSelectResult(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSelectResult(item)}
                    >
                      <div className="search-result-content">
                        <div className="search-result-meta">
                          <span className="search-result-badge">{item.category}</span>
                          <span className="search-result-title">{item.title}</span>
                        </div>
                        {item.snippet && (
                          <p className="search-result-snippet">{item.snippet}</p>
                        )}
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-muted shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="search-no-results">
                    <p className="no-res-title">No matching results for "{searchQuery}"</p>
                    <p className="no-res-desc">
                      Try searching for "Nutrition", "Freshness", "Hygiene", "Cooking", or "Meal Plan".
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        {/* Theme Toggle */}
        <button
          type="button"
          className="header-action-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <SunIcon className="w-4 h-4 text-amber" />
          ) : (
            <MoonIcon className="w-4 h-4 text-forest" />
          )}
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="notification-wrapper" ref={notifContainerRef}>
          <button
            type="button"
            className={`header-action-btn notification-btn ${isNotifOpen ? 'btn-active' : ''}`}
            onClick={() => setIsNotifOpen((prev) => !prev)}
            title="Notifications"
            aria-label="Notifications"
          >
            <BellIcon className="w-4 h-4 text-forest" />
            {unreadCount > 0 && (
              <span className="notification-badge-count">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <div className="notifications-title-row">
                  <h4 className="notifications-title">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="notifications-unread-pill">{unreadCount} new</span>
                  )}
                </div>
                <div className="notifications-actions">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="notif-text-btn"
                      onClick={onMarkAllNotificationsRead}
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      className="notif-text-btn text-danger"
                      onClick={onClearNotifications}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="notifications-body">
                {notifications.length === 0 ? (
                  <div className="notifications-empty">
                    <BellIcon className="w-8 h-8 text-muted mb-1" />
                    <p className="notif-empty-title">No notifications yet</p>
                    <p className="notif-empty-desc">
                      Real-time updates will appear here when food analyses, recipes, or meal plans complete.
                    </p>
                  </div>
                ) : (
                  <ul className="notifications-list">
                    {notifications.map((notif) => (
                      <li
                        key={notif.id}
                        className={`notification-item ${!notif.read ? 'notif-unread' : ''}`}
                        onClick={() => {
                          onSelectNotification?.(notif);
                          setIsNotifOpen(false);
                        }}
                      >
                        <div className="notif-icon-col">
                          {notif.type === 'error' ? (
                            <AlertTriangleIcon className="w-4 h-4 text-amber" />
                          ) : (
                            <CheckCircleIcon className="w-4 h-4 text-emerald" />
                          )}
                        </div>
                        <div className="notif-details">
                          <div className="notif-item-header">
                            <span className="notif-item-title">{notif.title}</span>
                            <span className="notif-item-time">{formatTime(notif.timestamp)}</span>
                          </div>
                          <p className="notif-item-msg">{notif.message}</p>
                        </div>
                        <button
                          type="button"
                          className="notif-dismiss-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDismissNotification?.(notif.id);
                          }}
                          title="Dismiss notification"
                          aria-label="Dismiss"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="header-profile-pill" title="Active Profile">
          <div className="profile-avatar">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <div className="profile-info">
            <span className="profile-name">Guest Explorer</span>
            <span className="profile-role">Nutrition & Wellness</span>
          </div>
        </div>
      </div>
    </header>
  );
}
