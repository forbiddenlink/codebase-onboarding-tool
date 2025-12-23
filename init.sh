#!/bin/bash

# CodeCompass - AI-Powered Codebase Onboarding Platform
# Development Environment Setup Script

set -e  # Exit on any error

echo "=========================================="
echo "  CodeCompass - Environment Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check Node.js version
print_info "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi
print_success "npm $(npm -v) detected"

# Check Git
print_info "Checking Git installation..."
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi
print_success "Git $(git --version | cut -d' ' -f3) detected"

# Check for .env file
print_info "Checking environment configuration..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env and add your Anthropic API key!"
        echo ""
        echo "  Get your API key from: https://console.anthropic.com/"
        echo ""
    else
        print_warning ".env.example not found. You'll need to create .env manually."
    fi
else
    print_success ".env file exists"
fi

# Install dependencies
print_info "Installing dependencies (this may take a few minutes)..."
echo ""
npm install
echo ""
print_success "Dependencies installed"

# Setup Prisma database
print_info "Setting up database with Prisma..."
if [ -d "packages/web/prisma" ]; then
    cd packages/web
    npx prisma generate
    npx prisma migrate dev --name init
    cd ../..
    print_success "Database initialized"
elif [ -f "prisma/schema.prisma" ]; then
    npx prisma generate
    npx prisma migrate dev --name init
    print_success "Database initialized"
else
    print_warning "Prisma schema not found yet. You may need to set it up manually."
fi

# Check if VS Code is installed (for extension development)
if command -v code &> /dev/null; then
    print_success "VS Code detected - extension development ready"
else
    print_info "VS Code not detected. Install it if you plan to develop the VS Code extension."
fi

echo ""
echo "=========================================="
echo "  Setup Complete! 🎉"
echo "=========================================="
echo ""
print_success "CodeCompass is ready to run!"
echo ""
echo "Quick Start Commands:"
echo "  ${BLUE}npm run dev${NC}          - Start web development server (port 3000)"
echo "  ${BLUE}npm run build${NC}        - Build for production"
echo "  ${BLUE}npm run lint${NC}         - Run linting"
echo "  ${BLUE}npm test${NC}             - Run tests"
echo ""
echo "Package-Specific Commands:"
echo "  ${BLUE}npm run dev -w web${NC}    - Start web app only"
echo "  ${BLUE}npm run dev -w cli${NC}    - Start CLI development"
echo "  ${BLUE}npm run build -w all${NC}  - Build all packages"
echo ""
echo "Access the application:"
echo "  🌐 Web Dashboard: ${GREEN}http://localhost:3000${NC}"
echo "  💻 CLI Tool: ${GREEN}npm run cli${NC} (after building)"
echo ""

# Check if .env has API key
if [ -f .env ]; then
    if ! grep -q "ANTHROPIC_API_KEY=sk-" .env 2>/dev/null; then
        print_warning "Remember to add your Anthropic API key to .env file!"
        echo "  Get your key: https://console.anthropic.com/"
        echo ""
    fi
fi

echo "📚 Documentation: See README.md for detailed instructions"
echo "🐛 Issues? Check the troubleshooting section in README.md"
echo ""
print_info "Starting development server in 3 seconds..."
sleep 3

# Start development server
npm run dev
