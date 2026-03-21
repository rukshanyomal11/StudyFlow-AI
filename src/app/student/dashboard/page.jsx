'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { getGreeting } from '@/lib/utils';

const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colors[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TaskItem = ({ task, onToggle }) => (
  <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
    <input
      type="checkbox"
      checked={task.completed}
      onChange={() => onToggle(task.id)}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <div className="ml-3 flex-1">
      <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
        {task.title}
      </p>
      <p className="text-xs text-gray-500">{task.subject} • {task.duration}</p>
    </div>
    <span className={`px-2 py-1 text-xs rounded-full ${
      task.priority === 'high' ? 'bg-red-100 text-red-600' :
      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
      'bg-green-100 text-green-600'
    }`}>
      {task.priority}
    </span>
  </div>
);

const RecommendationCard = ({ title, description, action, icon }) => (
  <Card className="border-l-4 border-l-blue-500">
    <CardContent className="p-4">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          {action && (
            <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
              {action}
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Review Calculus Chapter 5',
      subject: 'Mathematics',
      duration: '45 min',
      priority: 'high',
      completed: false,
    },
    {
      id: 2,
      title: 'Complete Physics Lab Report',
      subject: 'Physics',
      duration: '60 min',
      priority: 'medium',
      completed: false,
    },
    {
      id: 3,
      title: 'Read History Assignment',
      subject: 'History',
      duration: '30 min',
      priority: 'low',
      completed: true,
    },
  ]);

  const [stats, setStats] = useState({
    todayHours: 2.5,
    weekStreak: 5,
    completedTasks: 12,
    totalSubjects: 6,
  });

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {session?.user?.name}! 👋
        </h1>
        <p className="text-blue-100 mt-1">
          Ready to continue your learning journey? Let&apos;s make today productive!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Study Hours Today"
          value={stats.todayHours}
          subtitle="2 hours remaining"
          color="blue"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Study Streak"
          value={`${stats.weekStreak} days`}
          subtitle="Keep it up!"
          color="green"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <StatCard
          title="Tasks Completed"
          value={stats.completedTasks}
          subtitle="This week"
          color="purple"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Active Subjects"
          value={stats.totalSubjects}
          subtitle="Currently enrolled"
          color="orange"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today&apos;s Tasks</CardTitle>
              <Button variant="outline" size="sm">
                Add Task
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {tasks.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </div>
              {tasks.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No tasks for today</p>
                  <p className="text-sm">Create your first task to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RecommendationCard
                title="Review Mathematics"
                description="You haven&apos;t studied Math for 2 days. Consider a quick review session."
                action="Start Review →"
                icon={
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              />

              <RecommendationCard
                title="Take a Quiz"
                description="Test your knowledge with a Physics quiz to identify weak areas."
                action="Start Quiz →"
                icon={
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />

              <RecommendationCard
                title="Break Time"
                description={"You've been studying for 90 minutes. Take a 15-minute break."}
                icon={
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Session
            </Button>

            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Add Note
            </Button>

            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 16V6a1 1 0 011-1h8a1 1 0 011 1v14l-5-3-5 3z" />
              </svg>
              Review Cards
            </Button>

            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Take Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
