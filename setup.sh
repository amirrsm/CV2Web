#!/bin/bash

set -e

echo "🚀 Setting up CV2Web..."

# Create necessary directories
mkdir -p components/lib components/ui lib public

# Copy template files if they exist
if [ -d "template" ]; then
  echo "📁 Copying template files..."
  
  if [ -d "template/components" ]; then
    cp -r template/components/* components/ 2>/dev/null || true
  fi
  
  if [ -d "template/lib" ]; then
    cp -r template/lib/* lib/ 2>/dev/null || true
  fi
  
  echo "✓ Template files copied"
else
  echo "⚠️  Template directory not found. Creating basic structure..."
  # Create basic structure
  mkdir -p components/ui lib
fi

# Copy example resume if resume.yaml doesn't exist
if [ ! -f "resume.yaml" ] && [ -f "resume.example.yaml" ]; then
  echo "📝 Copying resume.example.yaml to resume.yaml..."
  cp resume.example.yaml resume.yaml
  echo "✓ Created resume.yaml - please edit it with your information"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit resume.yaml with your information"
echo "2. Add your photo to public/photo.png (or update the path in resume.yaml)"
echo "3. Run 'npm run generate' to generate the site"
echo "4. Run 'npm run dev' to preview locally"
echo "5. Push to GitHub to trigger GitHub Actions build"

