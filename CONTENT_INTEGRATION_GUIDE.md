# Content Integration System

Automatically pulls content from your CMS and displays it dynamically on your website. No manual updates needed - just add content in the CMS!

## Features

✅ **Automatic Content Pulling** - Fetches data from CMS tables in real-time
✅ **Events Display** - Shows upcoming events from content_calendar table
✅ **Blog Posts Display** - Displays published posts from content table
✅ **Stories Display** - Shows multimedia stories from stories table
✅ **Team Members Display** - Shows team profiles from user_profiles table
✅ **Real-time Updates** - Subscribes to database changes and updates automatically
✅ **Filtering & Search** - Built-in filters for all content types
✅ **Responsive Design** - Works on all device sizes
✅ **Performance Optimized** - Efficient querying and caching

## Quick Start

### 1. Import the Components

```typescript
import { 
  ContentIntegrationLayout,
  DynamicEvents,
  DynamicBlogPosts, 
  DynamicStories,
  DynamicTeamMembers
} from '../components/content';
```

### 2. Use the Complete Layout

The easiest way to get started is using the main layout component:

```tsx
import ContentIntegrationLayout from '../components/content/ContentIntegrationLayout';

function MyPage() {
  return (
    <div className="container mx-auto py-8">
      <ContentIntegrationLayout 
        showEvents={true}
        showBlogPosts={true}
        showStories={true}
        showTeamMembers={true}
        eventLimit={6}
        blogPostLimit={6}
        storyLimit={6}
        teamMemberLimit={8}
      />
    </div>
  );
}
```

### 3. Use Individual Components

You can also use individual components for more control:

```tsx
import DynamicEvents from '../components/content/DynamicEvents';
import DynamicBlogPosts from '../components/content/DynamicBlogPosts';

function CustomLayout() {
  return (
    <div className="space-y-12">
      <DynamicEvents 
        limit={4}
        showFilters={true}
        upcomingOnly={true}
        onViewAll={() => navigate('/events')}
      />
      
      <DynamicBlogPosts 
        limit={3}
        showFilters={false}
        featuredOnly={true}
        onPostClick={(post) => navigate(`/blog/${post.slug}`)}
      />
    </div>
  );
}
```

## Components Reference

### ContentIntegrationLayout

Main layout component that combines all dynamic content displays.

**Props:**
- `showEvents` (boolean) - Enable/disable events section
- `showBlogPosts` (boolean) - Enable/disable blog posts section  
- `showStories` (boolean) - Enable/disable stories section
- `showTeamMembers` (boolean) - Enable/disable team members section
- `eventLimit` (number) - Number of events to show (default: 6)
- `blogPostLimit` (number) - Number of blog posts to show (default: 6)
- `storyLimit` (number) - Number of stories to show (default: 6)
- `teamMemberLimit` (number) - Number of team members to show (default: 8)
- `onRefresh` (function) - Callback for refresh button

### DynamicEvents

Displays events from the `content_calendar` table.

**Props:**
- `limit` (number) - Number of events to display
- `showFilters` (boolean) - Show/hide filter controls
- `showViewAll` (boolean) - Show/hide "View All" button
- `upcomingOnly` (boolean) - Show only upcoming events
- `eventType` (string) - Filter by event type
- `onViewAll` (function) - Callback for view all button

### DynamicBlogPosts

Displays blog posts from the `content` table.

**Props:**
- `limit` (number) - Number of posts to display
- `showFilters` (boolean) - Show/hide filter controls
- `showViewAll` (boolean) - Show/hide "View All" button
- `featuredOnly` (boolean) - Show only featured posts
- `contentType` (string) - Filter by content type
- `onViewAll` (function) - Callback for view all button
- `onPostClick` (function) - Callback when post is clicked

### DynamicStories

Displays multimedia stories from the `stories` table.

**Props:**
- `limit` (number) - Number of stories to display
- `showFilters` (boolean) - Show/hide filter controls
- `showViewAll` (boolean) - Show/hide "View All" button
- `featuredOnly` (boolean) - Show only featured stories
- `storyType` (string) - Filter by story type
- `category` (string) - Filter by category
- `mediaType` (string) - Filter by media type
- `onViewAll` (function) - Callback for view all button
- `onStoryClick` (function) - Callback when story is clicked

### DynamicTeamMembers

Displays team members from the `user_profiles` table.

**Props:**
- `limit` (number) - Number of team members to display
- `showFilters` (boolean) - Show/hide filter controls
- `showViewAll` (boolean) - Show/hide "View All" button
- `roleFilter` (string) - Filter by role
- `featuredOnly` (boolean) - Show only featured members
- `onViewAll` (function) - Callback for view all button

## Advanced Usage

### Using the Content Integration Service Directly

```typescript
import ContentIntegrationService from '../services/ContentIntegrationService';

// Get events with custom filters
const events = await ContentIntegrationService.getEvents({
  limit: 10,
  filter: {
    status: 'scheduled',
    upcoming: true,
    event_type: 'workshop'
  },
  sort: {
    field: 'start_date',
    order: 'asc'
  }
});

// Get featured blog posts
const posts = await ContentIntegrationService.getBlogPosts({
  limit: 5,
  filter: {
    featured: true,
    status: 'published'
  }
});

// Subscribe to real-time updates
const unsubscribe = ContentIntegrationService.subscribeToChanges('events', (payload) => {
  console.log('Event updated:', payload);
  // Refresh your data
});
```

### Custom Filtering Examples

```typescript
// Show only upcoming events
<DynamicEvents upcomingOnly={true} />

// Show only featured blog posts  
<DynamicBlogPosts featuredOnly={true} />

// Show only cultural stories
<DynamicStories category="cultural" />

// Show only administrators
<DynamicTeamMembers roleFilter="admin" />
```

## Database Schema Requirements

The content integration system expects these tables in your database:

### content_calendar (Events)
```sql
- id (UUID, Primary Key)
- title (Text)
- description (Text)
- event_type (Text)
- start_date (Timestamp)
- end_date (Timestamp)
- location (Text)
- status (Text)
- tags (Text[])
- created_at (Timestamp)
- updated_at (Timestamp)
```

### content (Blog Posts)
```sql
- id (UUID, Primary Key)
- title (Text)
- content (Text)
- excerpt (Text)
- slug (Text)
- type (Text) - 'blog', 'article', 'post'
- status (Text) - 'published', 'draft'
- featured (Boolean)
- featured_image (Text)
- author (Text)
- published_at (Timestamp)
- views_count (Integer)
- likes_count (Integer)
- tags (JSON)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### stories (Multimedia Stories)
```sql
- id (UUID, Primary Key)
- title (Text)
- content (Text)
- excerpt (Text)
- author_name (Text)
- story_type (Text)
- category (Text)
- is_anonymous (Boolean)
- is_featured (Boolean)
- is_approved (Boolean)
- tags (Text[])
- media_type (Text) - 'text', 'audio', 'video', 'mixed'
- audio_url (Text)
- video_url (Text)
- thumbnail_url (Text)
- transcript (Text)
- view_count (Integer)
- submitted_at (Timestamp)
- approved_at (Timestamp)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### user_profiles (Team Members)
```sql
- id (UUID, Primary Key)
- username (Text)
- full_name (Text)
- email (Text)
- role (Text)
- bio (Text)
- avatar_url (Text)
- phone (Text)
- location (Text)
- linkedin_url (Text)
- twitter_url (Text)
- website_url (Text)
- skills (Text[])
- languages (Text[])
- is_active (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## Real-time Features

The system automatically subscribes to database changes and updates content in real-time:

- **Events**: Updates when new events are added or modified
- **Blog Posts**: Updates when posts are published or updated
- **Stories**: Updates when stories are approved or modified
- **Team Members**: Updates when profiles are added or changed

## Performance Features

- **Efficient Queries**: Uses optimized database queries with proper indexing
- **Caching**: Implements client-side caching for better performance
- **Pagination**: Built-in pagination support for large datasets
- **Lazy Loading**: Components load data efficiently
- **Real-time Only When Needed**: Subscriptions are cleaned up properly

## Customization

### Styling

All components use Tailwind CSS classes and can be customized:

```tsx
<DynamicEvents 
  className="custom-events-section"
  limit={4}
/>
```

### Custom Callbacks

```tsx
<DynamicBlogPosts 
  onPostClick={(post) => {
    // Custom navigation logic
    router.push(`/blog/${post.slug}`);
  }}
  onViewAll={() => {
    // Custom view all handler
    setShowModal(true);
  }}
/>
```

## Error Handling

The components include built-in error handling and loading states:

```tsx
if (loading) {
  return <LoadingSkeleton />;
}

if (error) {
  return <ErrorMessage error={error} onRetry={fetchData} />;
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Real-time features require WebSocket support
- Mobile responsive design

## Migration from Static Content

To migrate from static content to dynamic content:

1. **Import the components** you need
2. **Replace static data** with dynamic components
3. **Add your content** to the CMS tables
4. **Configure the components** with appropriate limits and filters
5. **Test real-time updates** by adding/editing content

## Best Practices

1. **Use appropriate limits** to prevent performance issues
2. **Enable filters** for better user experience
3. **Implement proper error handling** for production use
4. **Test real-time features** thoroughly
5. **Monitor database performance** for large datasets

## Troubleshooting

### Common Issues

1. **No content displayed**: Check database permissions and table structure
2. **Real-time not working**: Verify WebSocket connection and subscription setup
3. **Performance issues**: Reduce limits and implement pagination
4. **Styling issues**: Ensure Tailwind CSS is properly configured

### Debug Mode

Enable debug logging:

```typescript
ContentIntegrationService.subscribeToChanges('events', (payload) => {
  console.log('Real-time update:', payload);
});
```

## Support

For issues and questions:
1. Check the component documentation above
2. Verify database schema matches requirements
3. Test with minimal configuration first
4. Check browser console for errors

---

**Note**: This content integration system is designed to work seamlessly with your existing CMS. Simply add content through your admin interface and it will automatically appear on your website!