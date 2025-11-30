# XHR GET 400 Error Diagnosis

## Problem Analysis

**Failing Request:**
```
https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/content_tags?select=*,content_items(count)&order=name.asc
```

**Response:** HTTP/3 400 387ms

## Root Cause

The query has multiple issues:

### 1. Wrong Table Name
- **Issue:** Query uses `content_items` but the actual table is named `content`
- **Location:** In the select clause `content_items(count)`

### 2. Missing Name Field
- **Issue:** Query tries to order by `name.asc` but the `content_tags` junction table doesn't have a `name` field
- **The `name` field exists in the `tags` table, not in `content_tags`**

### 3. Incorrect Relationship Query
- **Issue:** The query structure doesn't properly reflect the database relationships
- **Database Structure:**
  - `content_tags` is a junction table between `content` and `tags`
  - `content_tags` has: `content_id`, `tag_id`
  - `tags` table has: `id`, `name`, `slug`, etc.
  - `content` table has: `id`, `title`, `content`, etc.

## Corrected Query Options

### Option 1: Get Tags with Content Count
```javascript
// Fetch tags with count of associated content
https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/tags?select=*,content_tags(count)&order=name.asc
```

### Option 2: Get Content-Tag Relationships
```javascript
// Fetch all content-tag relationships with tag details
https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/content_tags?select=*,tags(name,slug),content(id,title)&order=tags.name.asc
```

### Option 3: Get Tags with Content Details
```javascript
// Fetch tags with nested content details
https://sshguczouozvsdwzfcbx.supabase.co/rest/v1/tags?select=*,content_tags(content(*))&order=name.asc
```

## Database Schema Reference

### Tables Involved:
1. **tags** - Contains tag information
   - `id`, `name`, `slug`, `description`, `count`, `is_active`

2. **content** - Contains content items
   - `id`, `title`, `slug`, `content`, `type`, `status`

3. **content_tags** - Junction table between content and tags
   - `id`, `content_id` (FK to content), `tag_id` (FK to tags)

## Recommended Solution

Use **Option 1** for the most common use case:

```javascript
const { data, error } = await supabase
  .from('tags')
  .select('*, content_tags(count)')
  .order('name.asc')
```

This will return all tags with a count of how many content items are associated with each tag.