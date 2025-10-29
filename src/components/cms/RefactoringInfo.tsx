import React from 'react';
import { CheckCircle, FolderTree, FileCode, Database, BookOpen, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';

const RefactoringInfo: React.FC = () => {
  const refactoringStats = {
    sqlFilesMoved: 70,
    scriptsMoved: 20,
    docsMoved: 10,
    filesRemoved: 3,
    migrationsCreated: 2,
    date: 'October 29, 2025'
  };

  const newStructure = [
    {
      icon: FolderTree,
      title: 'Scripts Directory',
      description: 'Organized utility scripts',
      items: ['admin/', 'users/', 'testing/', 'utils/']
    },
    {
      icon: Database,
      title: 'Supabase Scripts',
      description: 'SQL scripts organized',
      items: ['setup/', 'fixes/', 'tests/', 'archived/']
    },
    {
      icon: BookOpen,
      title: 'Documentation',
      description: 'Categorized guides',
      items: ['setup/', 'troubleshooting/', 'roadmaps/']
    },
    {
      icon: FileCode,
      title: 'Migrations',
      description: 'Test & production ready',
      items: ['077_test_migration.sql', '078_production_migration.sql']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Project Refactoring Complete
            </h3>
            <p className="text-gray-600 mb-4">
              The project has been successfully refactored on {refactoringStats.date}. 
              All files are now properly organized for better maintainability and scalability.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{refactoringStats.sqlFilesMoved}+</div>
                <div className="text-xs text-gray-600">SQL Files</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{refactoringStats.scriptsMoved}+</div>
                <div className="text-xs text-gray-600">Scripts</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{refactoringStats.docsMoved}+</div>
                <div className="text-xs text-gray-600">Docs</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{refactoringStats.filesRemoved}</div>
                <div className="text-xs text-gray-600">Removed</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{refactoringStats.migrationsCreated}</div>
                <div className="text-xs text-gray-600">Migrations</div>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">✓</div>
                <div className="text-xs text-gray-600">Verified</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* New Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {newStructure.map((section, index) => (
          <Card key={index}>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <section.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{section.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                <ul className="space-y-1">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="text-xs text-gray-500 flex items-center">
                      <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Important Notes */}
      <Card>
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">Important Notes</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                <span>All npm scripts have been updated to reflect new file locations</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                <span>Migration scripts are ready for test and production deployment</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                <span>Documentation has been reorganized in the docs/ directory</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">•</span>
                <span>Build verification completed successfully - no breaking changes</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <Card>
        <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a
            href="/REFACTORING_PLAN.md"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <div className="text-sm font-medium text-gray-900">Refactoring Plan</div>
            <div className="text-xs text-gray-500 mt-1">Detailed analysis</div>
          </a>
          <a
            href="/docs/REFACTORING_SUMMARY.md"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <div className="text-sm font-medium text-gray-900">Summary</div>
            <div className="text-xs text-gray-500 mt-1">Complete overview</div>
          </a>
          <a
            href="/REFACTORING_COMPLETE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <div className="text-sm font-medium text-gray-900">Completion Report</div>
            <div className="text-xs text-gray-500 mt-1">Final status</div>
          </a>
          <a
            href="/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <div className="text-sm font-medium text-gray-900">Updated README</div>
            <div className="text-xs text-gray-500 mt-1">New structure</div>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default RefactoringInfo;