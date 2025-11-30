import React, { useState } from 'react';
import { 
  X, ChevronLeft, ChevronRight, BookOpen, 
  Eye, Settings, Users, FileText, Image, BarChart3,
  CheckCircle, PlayCircle, Lightbulb, Star, Zap, Heart,
  Palette, Sparkles, Shield, Database
} from 'lucide-react';
import Button from '../ui/Button';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
  tips?: string[];
  action?: {
    label: string;
    description: string;
  };
  roleSpecific?: boolean;
}

interface UserOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  completedSteps?: string[];
  onStepComplete?: (stepId: string) => void;
}

const UserOnboarding: React.FC<UserOnboardingProps> = ({
  isOpen,
  onClose,
  userRole,
  completedSteps = [],
  onStepComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const baseSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to BENIRAGE Studio',
      description: 'Your professional content management workspace',
      icon: Star,
      content: 'BENIRAGE Studio is designed to help you manage content efficiently. This guided tour will show you the key features.',
      tips: [
        'Navigate through the sidebar to access different sections',
        'Use the search feature to quickly find content',
        'Keyboard shortcuts are available for power users'
      ]
    },
    {
      id: 'overview-dashboard',
      title: 'Dashboard & Overview',
      description: 'Understanding your workspace metrics',
      icon: BarChart3,
      content: 'Monitor your content performance, user engagement, and system health through comprehensive dashboards.',
      tips: [
        'Multiple dashboard views available (Dashboard, Professional Dashboard, Advanced Dashboard)',
        'Real-time analytics help track performance',
        'Customize dashboard widgets to your needs'
      ]
    },
    {
      id: 'content-studio',
      title: 'Content Studio',
      description: 'Creating and managing content',
      icon: Palette,
      content: 'Access all content creation and management tools in one organized studio.',
      tips: [
        'Use modern content editors with live preview',
        'Content calendar helps with scheduling',
        'Stories feature for narrative content'
      ]
    },
    {
      id: 'media-library',
      title: 'Media Library',
      description: 'Managing your digital assets',
      icon: Image,
      content: 'Organize and manage all your media files including images, videos, audio, and documents.',
      tips: [
        'Professional media management with optimization',
        'Upload files by drag and drop',
        'Media optimization tools save bandwidth'
      ]
    },
    {
      id: 'community-management',
      title: 'Community Management',
      description: 'Managing users and interactions',
      icon: Users,
      content: 'Handle user management, applications, and community interactions effectively.',
      tips: [
        'Different roles have different permissions',
        'Track user applications and memberships',
        'Manage chat and communication tools'
      ]
    },
    {
      id: 'workflow-automation',
      title: 'Workflow & Automation',
      description: 'Streamlining your processes',
      icon: Settings,
      content: 'Automate workflows and streamline repetitive tasks for better efficiency.',
      tips: [
        'Set up automated content workflows',
        'Monitor workflow performance',
        'Customize automation rules'
      ]
    },
    {
      id: 'marketing-tools',
      title: 'Growth & Marketing',
      description: 'Expanding your reach',
      icon: Sparkles,
      content: 'Use marketing tools to grow your audience and improve engagement.',
      tips: [
        'Newsletter management for email campaigns',
        'SEO tools improve search visibility',
        'Advertisement management for monetization'
      ]
    },
    {
      id: 'analytics-reports',
      title: 'Analytics & Reports',
      description: 'Understanding performance',
      icon: BarChart3,
      content: 'Monitor content performance, user engagement, and site analytics to optimize your strategy.',
      tips: [
        'Content analytics show what works best',
        'Membership reports track community growth',
        'Export reports for detailed analysis'
      ]
    },
    {
      id: 'system-administration',
      title: 'System Administration',
      description: 'Managing the system',
      icon: Shield,
      content: 'Configure system settings, manage roles and permissions, and maintain the platform.',
      tips: [
        'Role-based access control ensures security',
        'Database management tools for maintenance',
        'Settings customization for your needs'
      ]
    }
  ];

  // Role-specific steps
  const getRoleSpecificSteps = () => {
    switch (userRole) {
      case 'super-admin':
        return [
          {
            id: 'super-admin-overview',
            title: 'System Administration',
            description: 'Managing the entire system',
            icon: Database,
            content: 'As a super admin, you have access to all system settings, user management, and advanced configuration options.',
            tips: [
              'Monitor system health in the dashboard',
              'Manage user permissions carefully',
              'Database management tools for maintenance'
            ]
          }
        ];
      case 'content-manager':
        return [
          {
            id: 'content-strategy',
            title: 'Content Strategy',
            description: 'Planning and organizing content',
            icon: BookOpen,
            content: 'As a content manager, focus on content planning, quality control, and team coordination.',
            tips: [
              'Use the content calendar for planning',
              'Review and approve content before publishing',
              'Coordinate with team members effectively'
            ]
          }
        ];
      case 'editor':
        return [
          {
            id: 'editorial-workflow',
            title: 'Editorial Workflow',
            description: 'Efficient content editing',
            icon: FileText,
            content: 'Focus on creating and editing high-quality content using our advanced editor features.',
            tips: [
              'Use the preview feature regularly',
              'Leverage auto-save for security',
              'Optimize content for SEO'
            ]
          }
        ];
      default:
        return [];
    }
  };

  const roleSpecificSteps = getRoleSpecificSteps();
  const allSteps = [...baseSteps, ...roleSpecificSteps];

  const handleNext = () => {
    if (currentStep < allSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (onStepComplete) {
      onStepComplete(allSteps[currentStep].id);
    }
    onClose();
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  if (!isOpen) return null;

  const currentStepData = allSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" />
      
      {/* Onboarding Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="cms-card-dark max-w-4xl w-full max-h-[90vh] overflow-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <currentStepData.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="cms-heading-lg text-white mb-1">{currentStepData.title}</h2>
                <p className="cms-text-secondary">{currentStepData.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="cms-btn-ghost-dark"
              >
                {isMinimized ? <PlayCircle className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isMinimized ? 'Expand' : 'Minimize'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                icon={X}
                className="cms-btn-ghost-dark"
              />
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Progress Bar */}
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="cms-text-secondary text-sm">
                    Step {currentStep + 1} of {allSteps.length}
                  </span>
                  <span className="cms-text-secondary text-sm">
                    {Math.round(((currentStep + 1) / allSteps.length) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / allSteps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Main Content */}
                  <div className="lg:col-span-2">
                    <div className="mb-6">
                      <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <currentStepData.icon className="w-6 h-6 text-yellow-400" />
                          <h3 className="text-white text-xl font-semibold">{currentStepData.title}</h3>
                        </div>
                        <p className="cms-text-base text-white leading-relaxed">
                          {currentStepData.content}
                        </p>
                      </div>

                      {/* Action Button */}
                      {'action' in currentStepData && currentStepData.action && (
                        <div className="mb-6">
                          <Button 
                            icon={Zap}
                            className="cms-btn-primary-dark"
                            onClick={() => {
                              // Navigate to the appropriate section based on current step
                              // This would integrate with the actual CMS navigation system
                            }}
                          >
                            {currentStepData.action.label}
                          </Button>
                          <p className="cms-text-secondary text-sm mt-2">
                            {currentStepData.action.description}
                          </p>
                        </div>
                      )}

                      {/* Tips */}
                      {currentStepData.tips && currentStepData.tips.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <Lightbulb className="w-5 h-5 text-amber-400" />
                            <h4 className="text-amber-400 font-medium">Pro Tips</h4>
                          </div>
                          <ul className="space-y-2">
                            {currentStepData.tips.map((tip, index) => (
                              <li key={index} className="cms-text-secondary text-sm flex items-start space-x-2">
                                <span className="text-amber-400 mt-1">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar Steps */}
                  <div className="lg:col-span-1">
                    <h4 className="cms-text-secondary text-sm font-medium mb-4 uppercase tracking-wide">
                      Tour Steps
                    </h4>
                    <div className="space-y-2">
                      {allSteps.map((step, index) => {
                        const IconComponent = step.icon;
                        const isCompleted = completedSteps.includes(step.id);
                        const isCurrent = index === currentStep;
                        
                        return (
                          <button
                            key={step.id}
                            onClick={() => handleStepClick(index)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                              isCurrent 
                                ? 'bg-amber-500/20 border border-amber-500/30' 
                                : 'hover:bg-gray-700/50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isCurrent 
                                  ? 'bg-amber-500 text-white' 
                                  : isCompleted
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-700 text-gray-300'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <IconComponent className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${
                                  isCurrent ? 'text-white' : 'cms-text-secondary'
                                }`}>
                                  {step.title}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  icon={ChevronLeft}
                  className="cms-btn-ghost-dark"
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleComplete}
                    icon={Heart}
                    className="cms-btn-ghost-dark"
                  >
                    Skip Tour
                  </Button>
                  
                  {currentStep < allSteps.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      icon={ChevronRight}
                      className="cms-btn-primary-dark"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      icon={CheckCircle}
                      className="cms-btn-primary-dark"
                    >
                      Finish Tour
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserOnboarding;