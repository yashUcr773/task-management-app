# Task Management App

A comprehensive task management application built with Next.js, featuring real-time updates, advanced filtering, and multi-organization support.

## 🚀 Features

- **Task Management**: Create, edit, and organize tasks with priorities, statuses, and due dates
- **Real-Time Updates**: Live task updates via WebSocket integration
- **Advanced Filtering**: Comprehensive filtering by status, priority, assignee, epic, and sprint
- **Calendar View**: Visual calendar interface with full filtering capabilities
- **Organizations & Teams**: Multi-organization support with team management
- **Dashboard**: Interactive dashboard with clickable statistics and filtering
- **Archive System**: Archive and restore tasks for better organization
- **File Attachments**: Upload and manage task attachments
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Real-Time**: WebSocket integration
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, shadcn/ui

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-management-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📚 Documentation

Comprehensive documentation is available in the [`/docs`](./docs) folder:

- **[📋 Complete Documentation Index](./docs/README.md)** - Navigate all project documentation
- **[🚀 Implementation Guides](./docs)** - Feature development and integration guides  
- **[🧪 Testing Documentation](./docs)** - Quality assurance and testing procedures
- **[⚡ Real-Time System](./docs/REALTIME_UPDATE_SUMMARY.md)** - WebSocket integration and live updates
- **[🎯 Feature Summaries](./docs)** - Individual feature implementation details

### Quick Links
- [Task Filters Implementation](./docs/TASK_FILTERS_IMPLEMENTATION.md)
- [Calendar Filters Implementation](./docs/CALENDAR_FILTERS_IMPLEMENTATION_COMPLETE.md)
- [Real-Time Testing Guide](./docs/REALTIME_TESTING_GUIDE.md)
- [Organizations Feature](./docs/ORGANIZATIONS_FEATURE.md)

## 🧪 Testing

Run the test suite:
```bash
npm test
```

For real-time feature testing, see the [Real-Time Testing Guide](./docs/REALTIME_TESTING_GUIDE.md).

## 🚢 Deployment

Build for production:
```bash
npm run build
```

The app is optimized for deployment on Vercel, but can be deployed to any platform supporting Next.js.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For detailed feature documentation and implementation guides, visit the [`/docs`](./docs) folder.
