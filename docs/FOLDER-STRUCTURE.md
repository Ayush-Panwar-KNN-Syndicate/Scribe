# Professional Folder Structure

## Overview

The project has been reorganized with a professional folder structure that separates concerns and improves maintainability.

## Folder Structure

```
scribe/
├── 📁 src/                     # Application source code
│   ├── app/                   # Next.js App Router pages and API routes
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utilities, configurations, and services
│   ├── types/                 # TypeScript type definitions
│   └── middleware.ts          # Next.js middleware
│
├── 📁 docs/                    # Documentation
│   ├── README.md              # Project overview and features
│   ├── DATABASE-SETUP.md      # Database configuration guide
│   ├── SEARCH-ARCHITECTURE.md # Search system documentation
│   ├── ADMIN.md               # Admin features and permissions
│   ├── DEPLOYMENT.md          # Deployment instructions
│   └── FOLDER-STRUCTURE.md    # This file
│
├── 📁 tools/                   # Development tools and utilities
│   ├── scripts/               # Database and setup scripts
│   │   ├── setup-database.js  # Automated database setup
│   │   ├── test-database.js   # Database connection testing
│   │   ├── manual-setup.sql   # Manual SQL commands
│   │   └── README.md          # Scripts documentation
│   └── searchtermux-search-worker/  # Cloudflare Worker for search
│       ├── src/               # Worker source code
│       ├── wrangler.toml      # Worker configuration
│       └── package.json       # Worker dependencies
│
├── 📁 configs/                 # Configuration files (organized)
│   ├── components.json        # UI components configuration
│   ├── eslint.config.mjs      # ESLint configuration
│   └── postcss.config.mjs     # PostCSS configuration
│
├── 📁 tests/                   # Test files and utilities
│   └── (empty - ready for future tests)
│
├── 📁 prisma/                  # Database schema and migrations
│   └── schema.prisma          # Prisma schema definition
│
├── 📁 public/                  # Static assets
│   ├── js/                    # Static JavaScript files
│   ├── styles/                # Static CSS files
│   └── *.svg                  # Icon files
│
└── 📄 Root Files              # Essential configuration files
    ├── README.md              # Main project documentation
    ├── package.json           # Dependencies and scripts
    ├── next.config.ts         # Next.js configuration
    ├── tsconfig.json          # TypeScript configuration
    ├── .gitignore             # Git ignore rules
    ├── .env                   # Environment variables (not committed)
    └── components.json        # UI components (symlinked from configs/)
```

## Key Improvements

### 1. Documentation Organization (`docs/`)
- ✅ **Centralized documentation** in dedicated folder
- ✅ **Comprehensive guides** for setup, deployment, and features
- ✅ **Professional structure** for easy navigation

### 2. Development Tools (`tools/`)
- ✅ **Database scripts** with automated setup
- ✅ **Search worker** isolated in its own environment
- ✅ **Clear separation** of development utilities

### 3. Configuration Management (`configs/`)
- ✅ **Organized configs** in dedicated folder
- ✅ **Symlinked where needed** for framework requirements
- ✅ **Cleaner root directory** with essential files only

### 4. Test Organization (`tests/`)
- ✅ **Dedicated test folder** ready for future tests
- ✅ **Separated from source code** for clarity
- ✅ **Scalable structure** for different test types

## Benefits

### Developer Experience
- **Easier navigation** - logical folder grouping
- **Faster onboarding** - clear documentation structure
- **Better maintenance** - separated concerns

### Project Management
- **Professional appearance** - industry-standard structure
- **Scalability** - room for growth in each category
- **Documentation-first** - comprehensive guides available

### Deployment
- **Clean builds** - proper exclusions in tsconfig
- **Organized assets** - clear separation of code and tools
- **Environment-specific configs** - proper configuration management

## Migration Notes

### Updated Paths
- Scripts moved from `scripts/` to `tools/scripts/`
- Documentation moved to `docs/` folder
- Configuration files organized in `configs/`

### Updated References
- ✅ `package.json` scripts updated
- ✅ `next.config.ts` exclusions updated
- ✅ `tsconfig.json` exclusions updated
- ✅ Database script paths corrected

### Maintained Functionality
- ✅ All npm scripts work correctly
- ✅ Database setup and testing functional
- ✅ Next.js build process unchanged
- ✅ Development workflow preserved

## Usage

### Common Commands
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production

# Database
npm run setup-database  # Set up new database (tools/scripts/)
npm run test-database   # Test database connection

# Documentation
# Navigate to docs/ folder for all guides
```

### Folder Navigation
```bash
# Source code
cd src/                 # Application code
cd src/components/      # React components
cd src/lib/            # Utilities and services

# Documentation
cd docs/               # All documentation
cat docs/README.md     # Project overview

# Tools
cd tools/scripts/      # Database and setup tools
cd tools/searchtermux-search-worker/  # Search worker

# Configuration
cd configs/            # Configuration files
```

This structure follows industry best practices and provides a solid foundation for scaling the project.





