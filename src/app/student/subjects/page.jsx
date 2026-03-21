'use client';

import React, { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';

const SubjectCard = ({ subject, onEdit, onDelete }) => (
  <Card className="group hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <div>
            <h3 className="font-semibold text-gray-900">{subject.name}</h3>
            <p className="text-sm text-gray-500">{subject.description}</p>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(subject)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(subject.id)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs text-gray-700">{subject.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${subject.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
        <span>Priority: {subject.priority}</span>
        {subject.examDate && (
          <span>Exam: {new Date(subject.examDate).toLocaleDateString()}</span>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: 'Mathematics',
      description: 'Calculus and Linear Algebra',
      color: '#3B82F6',
      priority: 'high',
      progress: 75,
      examDate: '2024-05-15',
    },
    {
      id: 2,
      name: 'Physics',
      description: 'Quantum Mechanics and Thermodynamics',
      color: '#10B981',
      priority: 'high',
      progress: 60,
      examDate: '2024-05-20',
    },
    {
      id: 3,
      name: 'Computer Science',
      description: 'Data Structures and Algorithms',
      color: '#8B5CF6',
      priority: 'medium',
      progress: 85,
      examDate: '2024-05-25',
    },
    {
      id: 4,
      name: 'Chemistry',
      description: 'Organic Chemistry',
      color: '#F59E0B',
      priority: 'medium',
      progress: 45,
      examDate: '2024-06-01',
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setShowAddForm(true);
  };

  const handleDelete = (subjectId) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
  };

  const AddSubjectForm = () => {
    const [formData, setFormData] = useState(editingSubject || {
      name: '',
      description: '',
      color: '#3B82F6',
      priority: 'medium',
      examDate: '',
    });

    const handleSubmit = (e) => {
      e.preventDefault();

      if (editingSubject) {
        setSubjects(subjects.map(s =>
          s.id === editingSubject.id
            ? { ...formData, id: editingSubject.id, progress: editingSubject.progress }
            : s
        ));
      } else {
        setSubjects([...subjects, {
          ...formData,
          id: Date.now(),
          progress: 0,
        }]);
      }

      setShowAddForm(false);
      setEditingSubject(null);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Subject Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Mathematics"
            />

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the subject"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded-md"
              />
            </div>

            <Input
              label="Exam Date (Optional)"
              type="date"
              value={formData.examDate}
              onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
            />

            <div className="flex space-x-3">
              <Button type="submit" variant="primary">
                {editingSubject ? 'Update Subject' : 'Add Subject'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingSubject(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600 mt-1">
            Manage your subjects and track your progress
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          Add Subject
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && <AddSubjectForm />}

      {/* Subjects Grid */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects yet</h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first subject to begin tracking your progress.
            </p>
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              Add Your First Subject
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
