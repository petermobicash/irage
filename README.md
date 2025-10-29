# Benirage Web Platform

A comprehensive web platform for the Benirage community with chat, content management, and administrative features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:production
```

## 📁 Project Structure

```
/
├── docs/                          # Documentation
│   ├── setup/                     # Setup and installation guides
│   ├── troubleshooting/           # Troubleshooting guides
│   ├── roadmaps/                  # Feature roadmaps
│   ├── REFACTORING_SUMMARY.md     # Recent refactoring details
│   └── *.md                       # Other documentation
├── scripts/                       # Utility scripts
│   ├── admin/                     # Admin management scripts
│   ├── users/                     # User management scripts
│   ├── testing/                   # Test scripts
│   └── utils/                     # Utility scripts
├── src/                           # Application source code
│   ├── components/                # React components
│   ├── hooks/                     # Custom React hooks
│   ├── pages/                     # Page components
│   ├── utils/                     # Utility functions
│   └── lib/                       # Library configurations
├── supabase/                      # Supabase configuration
│   ├── migrations/                # Database migrations
│   └── scripts/                   # SQL utility scripts
│       ├── archived/              # Archived scripts
│       ├── setup/                 # Setup scripts
│       ├── fixes/                 # Fix scripts
│       └── tests/                 # Test scripts
└── public/                        # Static assets
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:permissions` - Test permission system

### Admin & User Management
- `npm run setup:admin` - Set up admin user
- `npm run create:users` - Create test users
- `npm run create:users:workaround` - Alternative user creation method

### Deployment
- `npm run deploy:check` - Run pre-deployment checks
- `npm run deploy` - Build and prepare for deployment

## 📚 Documentation

### Setup Guides
- [Admin User Setup](docs/setup/ADMIN_USER_SETUP.md)
- [Authentication Setup](docs/setup/AUTH_SETUP_GUIDE.md)
- [User Creation Guide](docs/setup/USER_CREATION_README.md)

### Troubleshooting
- [Permission Issues](docs/troubleshooting/PERMISSIONS_TEST_README.md)
- [User Fixes](docs/troubleshooting/APPLY_USER_FIX_INSTRUCTIONS.md)
- [Quick Auth Fix](docs/troubleshooting/QUICK_FIX_AUTH.md)
- [Super Admin Guide](docs/troubleshooting/SUPER_ADMIN_README.md)

### Feature Documentation
- [API Reference](docs/api-reference.md)
- [Admin Guide](docs/admin-guide.md)
- [Editor Guide](docs/editor-guide.md)
- [Author Guide](docs/author-guide.md)
- [Reviewer Guide](docs/reviewer-guide.md)
- [Content Workflow](docs/content-workflow.md)
- [Deployment Guide](docs/deployment-guide.md)

### Roadmaps
- [Chat Features Roadmap](docs/roadmaps/CHAT_FEATURES_ROADMAP.md)

## 🔧 Recent Changes

The project underwent a major refactoring on October 29, 2025. Key improvements include:

- ✅ Reorganized 70+ SQL files into proper directories
- ✅ Moved 20+ JavaScript scripts to categorized folders
- ✅ Organized documentation by category
- ✅ Created comprehensive migration scripts for test and production
- ✅ Cleaned up root directory
- ✅ Updated all script references

For detailed information, see [REFACTORING_SUMMARY.md](docs/REFACTORING_SUMMARY.md).

## 🗄️ Database Migrations

### Running Migrations

```bash
# Check migration status
npx supabase db status

# Apply pending migrations
npx supabase db push

# Create a new migration
npx supabase migration new migration_name
```

### Important Migrations
- **077**: Consolidated test environment migration
- **078**: Production-ready migration with optimizations

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Test specific functionality
npm run test:permissions
```

## 🚀 Deployment

### Pre-deployment Checklist
1. Run `npm run deploy:check`
2. Verify all tests pass
3. Check TypeScript compilation
4. Review build output
5. Test in staging environment

### Production Deployment
```bash
# Build for production
npm run build:production

# Preview production build locally
npm run preview:production

# Deploy (upload dist/ folder to hosting platform)
npm run deploy
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📝 License

See [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues or questions:
1. Check the [troubleshooting guides](docs/troubleshooting/)
2. Review the [documentation](docs/)
3. Contact the development team

## 🔄 Version History

### Version 1.0.0 (October 29, 2025)
- Major refactoring and reorganization
- Improved project structure
- Enhanced documentation
- Production-ready migrations
- Performance optimizations

---

**Built with**: React, TypeScript, Vite, Supabase, TailwindCSS

**Last Updated**: October 29, 2025
