import React, { useState } from 'react';
import { 
  Globe, Settings, Database, FileCode, Package, 
  RefreshCw, Shield, Zap, HardDrive, Activity,
  CheckCircle, AlertTriangle, Info, Terminal
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface SystemStatus {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  cache: 'healthy' | 'warning' | 'error';
}

const WebsiteManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'deployment' | 'maintenance'>('overview');
  const [systemStatus] = useState<SystemStatus>({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy',
    cache: 'healthy'
  });

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Globe className="w-8 h-8 mr-3 text-blue-600" />
            Website Management
          </h2>
          <p className="text-gray-600 mt-1">Complete control over your website infrastructure</p>
        </div>
        <Button variant="outline" icon={RefreshCw}>
          Refresh Status
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'config', label: 'Configuration', icon: Settings },
            { id: 'deployment', label: 'Deployment', icon: Package },
            { id: 'maintenance', label: 'Maintenance', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Database</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Active</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {getStatusIcon(systemStatus.database)}
                <span className={`ml-2 text-sm px-2 py-1 rounded ${getStatusColor(systemStatus.database)}`}>
                  {systemStatus.database}
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">API</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Online</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {getStatusIcon(systemStatus.api)}
                <span className={`ml-2 text-sm px-2 py-1 rounded ${getStatusColor(systemStatus.api)}`}>
                  {systemStatus.api}
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Storage</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">75%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <HardDrive className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {getStatusIcon(systemStatus.storage)}
                <span className={`ml-2 text-sm px-2 py-1 rounded ${getStatusColor(systemStatus.storage)}`}>
                  {systemStatus.storage}
                </span>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cache</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Enabled</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Activity className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {getStatusIcon(systemStatus.cache)}
                <span className={`ml-2 text-sm px-2 py-1 rounded ${getStatusColor(systemStatus.cache)}`}>
                  {systemStatus.cache}
                </span>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="flex-col h-auto py-4">
                <Database className="w-6 h-6 mb-2" />
                <span className="text-sm">Backup Database</span>
              </Button>
              <Button variant="outline" className="flex-col h-auto py-4">
                <RefreshCw className="w-6 h-6 mb-2" />
                <span className="text-sm">Clear Cache</span>
              </Button>
              <Button variant="outline" className="flex-col h-auto py-4">
                <Shield className="w-6 h-6 mb-2" />
                <span className="text-sm">Security Scan</span>
              </Button>
              <Button variant="outline" className="flex-col h-auto py-4">
                <Terminal className="w-6 h-6 mb-2" />
                <span className="text-sm">Run Migrations</span>
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'Project refactoring completed', time: '2 hours ago', status: 'success' },
                { action: 'Database backup created', time: '5 hours ago', status: 'success' },
                { action: 'Security scan passed', time: '1 day ago', status: 'success' },
                { action: 'Cache cleared', time: '2 days ago', status: 'info' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-600" />
                    )}
                    <span className="text-sm text-gray-900">{activity.action}</span>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <input
                  type="text"
                  defaultValue="Benirage Web Platform"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
                <input
                  type="url"
                  defaultValue="https://benirage.org"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                <input
                  type="email"
                  defaultValue="admin@benirage.org"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Maintenance Mode</p>
                  <p className="text-sm text-gray-600">Temporarily disable public access</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Enable Caching</p>
                  <p className="text-sm text-gray-600">Improve site performance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Image Optimization</p>
                  <p className="text-sm text-gray-600">Automatically optimize uploaded images</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Deployment Tab */}
      {activeTab === 'deployment' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Status</h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Production Deployment Ready</p>
                    <p className="text-sm text-green-700">All checks passed. Ready to deploy.</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Test Environment</h4>
                  <p className="text-sm text-gray-600 mb-3">Migration: 077_consolidated_test_migration.sql</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Deploy to Test
                  </Button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Production Environment</h4>
                  <p className="text-sm text-gray-600 mb-3">Migration: 078_production_ready_migration.sql</p>
                  <Button size="sm" className="w-full">
                    Deploy to Production
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment History</h3>
            <div className="space-y-3">
              {[
                { version: 'v1.0.0', date: 'Oct 29, 2025', status: 'success', environment: 'Production' },
                { version: 'v0.9.5', date: 'Oct 28, 2025', status: 'success', environment: 'Test' },
                { version: 'v0.9.0', date: 'Oct 27, 2025', status: 'success', environment: 'Production' }
              ].map((deployment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deployment.version}</p>
                      <p className="text-xs text-gray-500">{deployment.environment}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{deployment.date}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Maintenance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" icon={Database} className="justify-start">
                Run Database Optimization
              </Button>
              <Button variant="outline" icon={RefreshCw} className="justify-start">
                Clean Up Old Data
              </Button>
              <Button variant="outline" icon={FileCode} className="justify-start">
                Verify Data Integrity
              </Button>
              <Button variant="outline" icon={Shield} className="justify-start">
                Update Indexes
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Maintenance</h3>
            <div className="space-y-3">
              <Button variant="outline" icon={RefreshCw} className="w-full justify-start">
                Clear Application Cache
              </Button>
              <Button variant="outline" icon={HardDrive} className="w-full justify-start">
                Clean Temporary Files
              </Button>
              <Button variant="outline" icon={Activity} className="w-full justify-start">
                Generate System Report
              </Button>
              <Button variant="outline" icon={Shield} className="w-full justify-start">
                Run Security Audit
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Tasks</h3>
            <div className="space-y-3">
              {[
                { task: 'Daily Database Backup', schedule: 'Every day at 2:00 AM', status: 'active' },
                { task: 'Weekly Security Scan', schedule: 'Every Sunday at 3:00 AM', status: 'active' },
                { task: 'Monthly Cleanup', schedule: 'First day of month at 1:00 AM', status: 'active' }
              ].map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.task}</p>
                    <p className="text-xs text-gray-500">{task.schedule}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WebsiteManager;