import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PlusIcon, 
  MagnifyingGlassIcon, 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  assignedBy: string;
  category: 'order' | 'support' | 'inventory' | 'general';
  estimatedTime: string;
  actualTime?: string;
  notes?: string;
}

const EmployeeTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Process Order #ORD-001',
      description: 'Verify payment and prepare shipment for John Doe\'s order',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2024-01-15',
      assignedBy: 'Manager',
      category: 'order',
      estimatedTime: '2 hours',
      actualTime: '1.5 hours',
      notes: 'Customer requested express delivery'
    },
    {
      id: '2',
      title: 'Resolve Support Ticket #ST-001',
      description: 'Help Sarah Wilson with smart switch installation issue',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-01-16',
      assignedBy: 'Support Lead',
      category: 'support',
      estimatedTime: '1 hour'
    },
    {
      id: '3',
      title: 'Update Product Inventory',
      description: 'Check stock levels for motion sensors and update system',
      priority: 'low',
      status: 'completed',
      dueDate: '2024-01-14',
      assignedBy: 'Inventory Manager',
      category: 'inventory',
      estimatedTime: '30 minutes',
      actualTime: '25 minutes'
    },
    {
      id: '4',
      title: 'Customer Follow-up Calls',
      description: 'Call 5 customers who received orders this week for feedback',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-01-17',
      assignedBy: 'Manager',
      category: 'general',
      estimatedTime: '2 hours'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    category: 'general' as Task['category'],
    estimatedTime: ''
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-blue-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'order': return 'text-blue-600 bg-blue-100';
      case 'support': return 'text-green-600 bg-green-100';
      case 'inventory': return 'text-purple-600 bg-purple-100';
      case 'general': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus }
        : task
    ));
  };

  const addNewTask = () => {
    if (!newTask.title || !newTask.description || !newTask.dueDate) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'pending',
      dueDate: newTask.dueDate,
      assignedBy: 'Self',
      category: newTask.category,
      estimatedTime: newTask.estimatedTime
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: 'general',
      estimatedTime: ''
    });
    setShowAddModal(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - iOS 26 Glassy Style */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-white/70 border-b border-white/60 shadow-lg shadow-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation Breadcrumb */}
          <div className="py-4 border-b border-white/40">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <button
                onClick={() => navigate('/employee')}
                className="flex items-center hover:text-gray-700 transition-colors"
              >
                <HomeIcon className="w-4 h-4 mr-1" />
                Employee Dashboard
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Task Management</span>
            </nav>
          </div>
          
          <div className="py-6">
            {/* Mobile Navigation */}
            <div className="flex items-center justify-between mb-4 md:hidden">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go Back"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Task Management</h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Go Back"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <CheckCircleIcon className="w-8 h-8 mr-3 text-blue-600" />
                    Task Management
                  </h1>
                  <p className="text-gray-600 mt-1">Manage and track assigned tasks and responsibilities</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Welcome, Employee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="backdrop-blur-2xl bg-white/80 shadow-2xl rounded-3xl border-2 border-white/60 p-6">
          {/* Header Actions - iOS 26 Glassy */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">✅ My Tasks</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-6 py-3 backdrop-blur-2xl bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-600/95 hover:to-blue-700/95 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2 border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Task
            </button>
          </div>

          {/* Search and Filters - iOS 26 Glassy */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search tasks by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-300 font-medium"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 cursor-pointer appearance-none font-medium"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5rem',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 cursor-pointer appearance-none font-medium"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5rem',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 backdrop-blur-xl bg-white/60 border-2 border-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-300 focus:bg-white/75 text-gray-900 shadow-sm transition-all duration-300 cursor-pointer appearance-none font-medium"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5rem',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="order">Order</option>
                  <option value="support">Support</option>
                  <option value="inventory">Inventory</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className={`hover:bg-gray-50 ${isOverdue(task.dueDate) ? 'bg-red-50' : ''}`}>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{task.description}</div>
                      {task.notes && (
                        <div className="text-xs text-blue-600 mt-1">📝 {task.notes}</div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                        {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(task.dueDate).toLocaleDateString()}</div>
                      {isOverdue(task.dueDate) && (
                        <div className="text-xs text-red-600 flex items-center">
                          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          Overdue
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4" />
                        <span>Est: {task.estimatedTime}</span>
                        {task.actualTime && (
                          <span className="text-green-600">| Act: {task.actualTime}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {task.status === 'pending' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in-progress')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Start Task"
                          >
                            <ClockIcon className="h-4 w-4" />
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="text-green-600 hover:text-green-900"
                            title="Complete Task"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {/* Edit task */}}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Task"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Stats - iOS 26 Glassy */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="backdrop-blur-2xl bg-blue-50/80 p-4 rounded-2xl border-2 border-white/60 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="text-sm font-bold text-blue-600">Total Tasks</div>
              <div className="text-2xl font-bold text-blue-900">{tasks.length}</div>
            </div>
            <div className="backdrop-blur-2xl bg-yellow-50/80 p-4 rounded-2xl border-2 border-white/60 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="text-sm font-bold text-yellow-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-900">{tasks.filter(t => t.status === 'pending').length}</div>
            </div>
            <div className="backdrop-blur-2xl bg-blue-50/80 p-4 rounded-2xl border-2 border-white/60 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="text-sm font-bold text-blue-600">In Progress</div>
              <div className="text-2xl font-bold text-blue-900">{tasks.filter(t => t.status === 'in-progress').length}</div>
            </div>
            <div className="backdrop-blur-2xl bg-green-50/80 p-4 rounded-2xl border-2 border-white/60 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="text-sm font-bold text-green-600">Completed</div>
              <div className="text-2xl font-bold text-green-900">{tasks.filter(t => t.status === 'completed').length}</div>
            </div>
            <div className="backdrop-blur-2xl bg-red-50/80 p-4 rounded-2xl border-2 border-white/60 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="text-sm font-bold text-red-600">Overdue</div>
              <div className="text-2xl font-bold text-red-900">{tasks.filter(t => isOverdue(t.dueDate)).length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Task Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter task description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                      className="mt-1 block w-full px-3 py-2 backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Task['category'] })}
                      className="mt-1 block w-full px-3 py-2 backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="order">Order</option>
                      <option value="support">Support</option>
                      <option value="inventory">Inventory</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estimated Time</label>
                    <input
                      type="text"
                      value={newTask.estimatedTime}
                      onChange={(e) => setNewTask({ ...newTask, estimatedTime: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., 2 hours"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 backdrop-blur-xl bg-white/70 border-2 border-white/60 rounded-xl focus:ring-2 transition-all duration-300 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addNewTask}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasksPage;
