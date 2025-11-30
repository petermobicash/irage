/**
 * Dynamic Events Component
 * Automatically displays events from content_calendar table
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Tag, ExternalLink, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ContentIntegrationService, { EventData, ContentIntegrationOptions } from '../../services/ContentIntegrationService';

interface DynamicEventsProps {
  limit?: number;
  showFilters?: boolean;
  showViewAll?: boolean;
  onViewAll?: () => void;
  className?: string;
  upcomingOnly?: boolean;
  eventType?: string;
}

const DynamicEvents: React.FC<DynamicEventsProps> = ({
  limit = 6,
  showFilters = true,
  showViewAll = true,
  onViewAll,
  className = '',
  upcomingOnly = true,
  eventType
}) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'scheduled',
    event_type: eventType || '',
    upcoming: upcomingOnly
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const options: ContentIntegrationOptions = {
        limit,
        filter: {
          status: filters.status,
          upcoming: filters.upcoming,
          ...(filters.event_type && { event_type: filters.event_type })
        },
        sort: {
          field: 'start_date',
          order: 'asc'
        }
      };

      const result = await ContentIntegrationService.getEvents(options);
      
      if (result.success) {
        setEvents(result.data);
      } else {
        setError(result.error || 'Failed to load events');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [limit, filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = ContentIntegrationService.subscribeToChanges('events', (payload) => {
      console.log('Real-time event update:', payload);
      fetchEvents(); // Refresh data when changes occur
    });

    return unsubscribe;
  }, [fetchEvents]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: { [key: string]: string } = {
      'workshop': 'bg-blue-100 text-blue-800',
      'seminar': 'bg-green-100 text-green-800',
      'conference': 'bg-purple-100 text-purple-800',
      'training': 'bg-orange-100 text-orange-800',
      'meeting': 'bg-gray-100 text-gray-800',
      'social': 'bg-pink-100 text-pink-800'
    };
    return colors[eventType?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Upcoming Events</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Failed to Load Events</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchEvents} variant="outline">
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
          <Calendar className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Upcoming Events</h3>
          <span className="text-sm text-gray-500">({events.length})</span>
        </div>
        {showViewAll && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewAll}
            icon={ExternalLink}
          >
            View All Events
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={filters.event_type}
              onChange={(e) => handleFilterChange('event_type', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="conference">Conference</option>
              <option value="training">Training</option>
              <option value="meeting">Meeting</option>
              <option value="social">Social</option>
            </select>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={filters.upcoming}
                onChange={(e) => handleFilterChange('upcoming', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Upcoming only</span>
            </label>
          </div>
        </Card>
      )}

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-all duration-300 group">
              <div className="space-y-4">
                {/* Event Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h4>
                    {event.event_type && (
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Event Description */}
                {event.description && (
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {event.description}
                  </p>
                )}

                {/* Event Details */}
                <div className="space-y-2">
                  {/* Date & Time */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatEventDate(event.start_date)}</span>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      event.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                    {isEventUpcoming(event.start_date) && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="flex items-center space-x-1 flex-wrap">
                    <Tag className="w-3 h-3 text-gray-400" />
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {event.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{event.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Found</h3>
          <p className="text-gray-500">
            {upcomingOnly ? 'No upcoming events at the moment.' : 'No events match your current filters.'}
          </p>
        </Card>
      )}

      {/* Real-time Update Indicator */}
      <div className="text-center">
        <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Updates automatically when new events are added</span>
        </p>
      </div>
    </div>
  );
};

export default DynamicEvents;