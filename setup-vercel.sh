#!/bin/bash

# Setup script for Vercel deployment
# This script helps you configure your project for Vercel deployment

set -e

echo "🚀 Vercel Deployment Setup for thewhite.cool"
echo "=============================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    pnpm add -g vercel
else
    echo "✅ Vercel CLI already installed"
fi

echo ""
echo "🔐 Step 1: Login to Vercel"
echo "-------------------------"
vercel login

echo ""
echo "🔗 Step 2: Link to Vercel Project"
echo "--------------------------------"
vercel link

echo ""
echo "📋 Step 3: Getting Project Information"
echo "-------------------------------------"

if [ -f ".vercel/project.json" ]; then
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId": "[^"]*' | cut -d'"' -f4)
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId": "[^"]*' | cut -d'"' -f4)
    
    echo ""
    echo "✅ Project linked successfully!"
    echo ""
    echo "📝 Add these secrets to GitHub:"
    echo "================================"
    echo ""
    echo "Go to: https://github.com/kanetran29/fashion-web/settings/secrets/actions"
    echo ""
    echo "Add the following secrets:"
    echo ""
    echo "1. VERCEL_ORG_ID"
    echo "   Value: $ORG_ID"
    echo ""
    echo "2. VERCEL_PROJECT_ID"
    echo "   Value: $PROJECT_ID"
    echo ""
    echo "3. VERCEL_TOKEN"
    echo "   Get from: https://vercel.com/account/tokens"
    echo "   Create a new token named 'GitHub Actions'"
    echo ""
    echo "4. DATABASE_URI"
    echo "   Get from: Vercel Dashboard → Storage → Postgres"
    echo "   Format: postgres://default:xxxxx@xxx.postgres.vercel-storage.com:5432/verceldb"
    echo ""
    echo "5. PAYLOAD_SECRET"
    echo "   Value: a10fd66fcd29186f571c37f89fc4f3a60a93e701be91a1e700ba11cbe802c661"
    echo ""
else
    echo "❌ Failed to link project. Please run 'vercel link' manually."
    exit 1
fi

echo ""
echo "🌐 Step 4: Domain Configuration"
echo "------------------------------"
echo ""
echo "1. Add domain in Vercel:"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Select your project"
echo "   - Settings → Domains"
echo "   - Add: thewhite.cool"
echo ""
echo "2. Configure DNS at Porkbun:"
echo "   - Go to: https://porkbun.com/account/domainsSpeedy"
echo "   - Select: thewhite.cool"
echo "   - Add A record:"
echo "     Type: A"
echo "     Host: @"
echo "     Answer: 76.76.21.21"
echo "     TTL: 600"
echo ""
echo "   - Add CNAME record:"
echo "     Type: CNAME"
echo "     Host: www"
echo "     Answer: cname.vercel-dns.com"
echo "     TTL: 600"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - DEPLOYMENT.md (full guide)"
echo "   - DOMAIN-SETUP.md (domain-specific guide)"
echo ""
echo "✅ Setup complete! Next steps:"
echo "=============================="
echo ""
echo "1. Add GitHub secrets (see above)"
echo "2. Configure domain in Vercel and Porkbun"
echo "3. Push to main branch:"
echo "   git add ."
echo "   git commit -m 'Configure Vercel deployment'"
echo "   git push origin main"
echo ""
echo "4. Monitor deployment:"
echo "   - GitHub Actions: https://github.com/kanetran29/fashion-web/actions"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"
echo ""
echo "🎉 Your site will be live at https://thewhite.cool"
echo ""

