/**
 * Dynamic Team Members Component
 * Automatically displays team members from user_profiles table
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Mail, Phone, MapPin, Globe, Linkedin, Twitter, Award, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ContentIntegrationService, { TeamMemberData, ContentIntegrationOptions } from '../../services/ContentIntegrationService';

interface DynamicTeamMembersProps {
  limit?: number;
  showFilters?: boolean;
  showViewAll?: boolean;
  onViewAll?: () => void;
  className?: string;
  roleFilter?: string;
  featuredOnly?: boolean;
}

const DynamicTeamMembers: React.FC<DynamicTeamMembersProps> = ({
  limit = 8,
  showFilters = true,
  showViewAll = true,
  onViewAll,
  className = '',
  roleFilter,
  featuredOnly = false
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    role: roleFilter || '',
    featured: featuredOnly
  });

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const options: ContentIntegrationOptions = {
        limit,
        filter: {
          ...(filters.role && { role: filters.role }),
          featured: filters.featured
        },
        sort: {
          field: 'full_name',
          order: 'asc'
        }
      };

      const result = await ContentIntegrationService.getTeamMembers(options);
      
      if (result.success) {
        setTeamMembers(result.data);
      } else {
        setError(result.error || 'Failed to load team members');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [limit, filters]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = ContentIntegrationService.subscribeToChanges('teamMembers', (payload) => {
      console.log('Real-time team member update:', payload);
      fetchTeamMembers(); // Refresh data when changes occur
    });

    return unsubscribe;
  }, [fetchTeamMembers]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'admin': 'bg-purple-100 text-purple-800',
      'content-manager': 'bg-blue-100 text-blue-800',
      'editor': 'bg-green-100 text-green-800',
      'author': 'bg-orange-100 text-orange-800',
      'contributor': 'bg-yellow-100 text-yellow-800',
      'volunteer': 'bg-pink-100 text-pink-800',
      'member': 'bg-gray-100 text-gray-800'
    };
    return colors[role?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatRoleName = (role: string) => {
    return role
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Our Team</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="space-y-4 text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <Card className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Failed to Load Team Members</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchTeamMembers} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Our Team</h3>
          <span className="text-sm text-gray-500">({teamMembers.length})</span>
        </div>
        {showViewAll && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewAll}
          >
            View All Team
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="content-manager">Content Managers</option>
              <option value="editor">Editors</option>
              <option value="author">Authors</option>
              <option value="contributor">Contributors</option>
              <option value="volunteer">Volunteers</option>
            </select>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Featured members</span>
            </label>
          </div>
        </Card>
      )}

      {/* Team Members Grid */}
      {teamMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-lg transition-all duration-300 group">
              <div className="space-y-4 text-center">
                {/* Avatar */}
                <div className="relative">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-lg">
                      {getInitials(member.full_name)}
                    </div>
                  )}
                  
                  {/* Role Badge */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                      {formatRoleName(member.role)}
                    </span>
                  </div>
                </div>

                {/* Member Info */}
                <div className="pt-4 space-y-2">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {member.full_name}
                  </h4>
                  
                  {member.username && (
                    <p className="text-sm text-gray-500">@{member.username}</p>
                  )}

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {member.bio}
                    </p>
                  )}

                  {/* Location */}
                  {member.location && (
                    <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{member.location}</span>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="flex items-center justify-center space-x-3 pt-2">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="text-gray-400 hover:text-green-600 transition-colors"
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    
                    {member.linkedin_url && (
                      <a
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    
                    {member.twitter_url && (
                      <a
                        href={member.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title="Twitter"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    
                    {member.website_url && (
                      <a
                        href={member.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-purple-600 transition-colors"
                        title="Website"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Skills */}
                  {member.skills && member.skills.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {member.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{member.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {member.languages && member.languages.length > 0 && (
                    <div className="text-xs text-gray-500 flex items-center justify-center space-x-1">
                      <Award className="w-3 h-3" />
                      <span>{member.languages.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Team Members Found</h3>
          <p className="text-gray-500">
            {featuredOnly ? 'No featured team members at the moment.' : 'No team members match your current filters.'}
          </p>
        </Card>
      )}

      {/* Real-time Update Indicator */}
      <div className="text-center">
        <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Updates automatically when team information changes</span>
        </p>
      </div>
    </div>
  );
};

export default DynamicTeamMembers;