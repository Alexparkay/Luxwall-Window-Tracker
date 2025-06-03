import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Plus,
  Filter,
  Download,
  Bell,
  Users,
  MapPin,
  Clock,
} from 'lucide-react';

const CalendarPage: React.FC = () => {
  const [selectedView, setSelectedView] = useState('month');

  const events = [
    {
      id: '1',
      title: 'Building Inspection - Tower A',
      start: new Date().toISOString(),
      type: 'inspection',
      location: 'Downtown',
    },
    {
      id: '2',
      title: 'System Maintenance',
      start: new Date(Date.now() + 86400000).toISOString(),
      type: 'maintenance',
      location: 'Server Room',
    },
    {
      id: '3',
      title: 'User Training Session',
      start: new Date(Date.now() + 172800000).toISOString(),
      type: 'training',
      location: 'Conference Room',
    },
  ];

  const upcomingEvents = events.slice(0, 3);

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
              <Calendar className="w-8 h-8 text-glass-accent-primary" />
            </div>
            <div>
              <h1 className="heading-1 mb-2">Calendar & Events</h1>
              <p className="body-text">
                Manage your urban 3D navigation system events and schedules.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              Add Event
            </motion.button>
            <motion.button
              className="btn-secondary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter className="w-4 h-4" />
              Filter
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar Section */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="modern-card"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="heading-3">November 2024</h3>
                <motion.button
                  className="btn-glass p-2"
                  whileHover={{ scale: 1.05 }}
                >
                  ←
                </motion.button>
                <motion.button
                  className="btn-glass p-2"
                  whileHover={{ scale: 1.05 }}
                >
                  →
                </motion.button>
              </div>
              
              <div className="flex items-center gap-2">
                {['month', 'week', 'day'].map((view) => (
                  <motion.button
                    key={view}
                    onClick={() => setSelectedView(view)}
                    className={`btn-glass px-4 py-2 text-sm capitalize ${
                      selectedView === view ? 'bg-glass-accent-primary text-white' : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {view}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Calendar Grid - Simplified */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-glass-text-muted">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 5; // Starting from day -5 to show previous month
                const isCurrentMonth = day > 0 && day <= 30;
                const isToday = day === new Date().getDate() && isCurrentMonth;
                const hasEvent = [5, 12, 18, 25].includes(day);

                return (
                  <motion.div
                    key={i}
                    className={`
                      aspect-square p-2 text-sm cursor-pointer transition-all duration-300 rounded-lg
                      ${isCurrentMonth ? 'text-glass-text-primary hover:bg-glass-background-accent/50' : 'text-glass-text-muted'}
                      ${isToday ? 'bg-glass-accent-primary text-white' : ''}
                      ${hasEvent ? 'bg-glass-accent-secondary/20 border border-glass-accent-secondary/30' : ''}
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex flex-col h-full">
                      <span className="font-medium">
                        {day > 0 && day <= 30 ? day : ''}
                      </span>
                      {hasEvent && (
                        <div className="mt-1">
                          <div className="w-1 h-1 bg-glass-accent-secondary rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="modern-card"
          >
            <h3 className="heading-3 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-3 rounded-lg bg-glass-background-accent/30 hover:bg-glass-background-accent/50 transition-colors duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      event.type === 'inspection' ? 'bg-glass-accent-primary/20 text-glass-accent-primary' :
                      event.type === 'maintenance' ? 'bg-glass-accent-warning/20 text-glass-accent-warning' :
                      'bg-glass-accent-secondary/20 text-glass-accent-secondary'
                    }`}>
                      {event.type === 'inspection' ? <MapPin className="w-4 h-4" /> :
                       event.type === 'maintenance' ? <Clock className="w-4 h-4" /> :
                       <Users className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-glass-text-primary truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-glass-text-muted">
                        {event.location}
                      </p>
                      <p className="text-xs text-glass-text-muted">
                        {new Date(event.start).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="modern-card"
          >
            <h3 className="heading-3 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: Plus, label: 'Schedule Inspection', color: 'text-glass-accent-primary' },
                { icon: Bell, label: 'Set Reminder', color: 'text-glass-accent-warning' },
                { icon: Download, label: 'Export Calendar', color: 'text-glass-accent-secondary' },
                { icon: Users, label: 'Team Schedule', color: 'text-glass-accent-primary' },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  className="w-full btn-glass flex items-center gap-3 text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-sm font-medium">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarPage; 