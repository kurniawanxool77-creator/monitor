#!/bin/bash

# Simpel - Fullstack Setup Script
# Run this script to setup both backend and frontend

echo "╔══════════════════════════════════════════════════════╗"
echo "║  🚀 SIMPEL Fullstack Setup                           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
else
    echo "   Dependencies already installed"
fi

echo "   Generating Prisma Client..."
npm run db:generate

echo "   Creating database..."
npm run db:push

echo "   Seeding database..."
npm run db:seed

cd ..

echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
else
    echo "   Dependencies already installed"
fi

cd ..

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                                 ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║                                                      ║"
echo "║  Backend:  http://localhost:3001                     ║"
echo "║  Frontend: http://localhost:5173                    ║"
echo "║                                                      ║"
echo "║  Default Credentials:                                ║"
echo "║  • Superadmin: admin@simpek.com / admin123          ║"
echo "║  • Admin: operator@simpek.com / admin123           ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "To start development servers, run:"
echo "  • Backend:  cd backend && npm run dev"
echo "  • Frontend: cd frontend && npm run dev"
