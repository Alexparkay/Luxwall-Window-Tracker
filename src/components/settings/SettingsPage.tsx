import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Database,
  Monitor,
  Save,
  RefreshCw,
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: true,
    },
    appearance: {
      theme: 'dark',
      animations: true,
      sidebar: 'expanded',
    },
    system: {
      autoSave: true,
      dataRetention: '30',
      backupFrequency: 'daily',
    },
  });

  const settingsTabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'system', label: 'System', icon: Database },
  ];

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="heading-3 mb-4">General Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-glass-background-accent/30">
                  <div>
                    <p className="text-sm font-medium text-glass-text-primary">Language</p>
                    <p className="text-xs text-glass-text-muted">Choose your preferred language</p>
                  </div>
                  <select className="input-glass w-32">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-glass-background-accent/30">
                  <div>
                    <p className="text-sm font-medium text-glass-text-primary">Time Zone</p>
                    <p className="text-xs text-glass-text-muted">Set your local time zone</p>
                  </div>
                  <select className="input-glass w-48">
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC+0 (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="heading-3 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-glass-background-accent/30">
                    <div>
                      <p className="text-sm font-medium text-glass-text-primary capitalize">
                        {key} Notifications
                      </p>
                      <p className="text-xs text-glass-text-muted">
                        Receive notifications via {key}
                      </p>
                    </div>
                    <motion.button
                      onClick={() => updateSetting('notifications', key, !value)}
                      className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                        value ? 'bg-glass-accent-primary' : 'bg-glass-background-accent'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow-lg"
                        animate={{ x: value ? 24 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="heading-3 mb-4">Appearance Settings</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-glass-background-accent/30">
                  <p className="text-sm font-medium text-glass-text-primary mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['dark', 'light', 'auto'].map((theme) => (
                      <motion.button
                        key={theme}
                        onClick={() => updateSetting('appearance', 'theme', theme)}
                        className={`p-3 rounded-lg border transition-all duration-300 ${
                          settings.appearance.theme === theme
                            ? 'border-glass-accent-primary bg-glass-accent-primary/20'
                            : 'border-white/10 bg-glass-background-accent/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-sm font-medium capitalize">{theme}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-glass-background-accent/30">
                  <div>
                    <p className="text-sm font-medium text-glass-text-primary">Animations</p>
                    <p className="text-xs text-glass-text-muted">Enable smooth animations</p>
                  </div>
                  <motion.button
                    onClick={() => updateSetting('appearance', 'animations', !settings.appearance.animations)}
                    className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                      settings.appearance.animations ? 'bg-glass-accent-primary' : 'bg-glass-background-accent'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full shadow-lg"
                      animate={{ x: settings.appearance.animations ? 24 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="heading-3 mb-4">System Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-glass-background-accent/30">
                  <div>
                    <p className="text-sm font-medium text-glass-text-primary">Auto Save</p>
                    <p className="text-xs text-glass-text-muted">Automatically save changes</p>
                  </div>
                  <motion.button
                    onClick={() => updateSetting('system', 'autoSave', !settings.system.autoSave)}
                    className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                      settings.system.autoSave ? 'bg-glass-accent-primary' : 'bg-glass-background-accent'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full shadow-lg"
                      animate={{ x: settings.system.autoSave ? 24 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-glass-background-accent/30">
                  <div>
                    <p className="text-sm font-medium text-glass-text-primary">Data Retention</p>
                    <p className="text-xs text-glass-text-muted">How long to keep data (days)</p>
                  </div>
                  <input
                    type="number"
                    value={settings.system.dataRetention}
                    onChange={(e) => updateSetting('system', 'dataRetention', e.target.value)}
                    className="input-glass w-20 text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-glass-text-muted">Select a settings category</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="modern-card"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-glass-accent-primary/20">
              <Settings className="w-8 h-8 text-glass-accent-primary" />
            </div>
            <div>
              <h1 className="heading-1 mb-2">Settings</h1>
              <p className="body-text">
                Configure your urban 3D navigation system preferences.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </motion.button>
            <motion.button
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Settings Navigation */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="modern-card"
        >
          <h3 className="heading-3 mb-4">Categories</h3>
          <nav className="space-y-2">
            {settingsTabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-300 ${
                    isActive
                      ? 'bg-glass-accent-primary/20 text-glass-accent-primary border-l-4 border-glass-accent-primary'
                      : 'text-glass-text-secondary hover:bg-glass-background-accent/50 hover:text-glass-text-primary'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeSettingsIndicator"
                      className="ml-auto w-2 h-2 bg-glass-accent-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>
        </motion.div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="modern-card min-h-96"
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage; 