#!/usr/bin/env node

/**
 * CV2Web Generator
 * Reads resume.yaml and generates a Next.js site
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Color helper functions
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMultiline(text) {
  if (!text) return '';
  return text.split('\n').map(line => line.trim()).filter(line => line).join('\n');
}

// Generate page.tsx
function generatePage(resume) {
  const { personal, summary, experience, projects, volunteering, skills, education, languages, canvas } = resume;
  
  const nameParts = personal.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  const links = [];
  if (personal.links.github) {
    links.push({ icon: 'Github', label: personal.links.github.username, href: personal.links.github.url });
  }
  if (personal.links.linkedin) {
    links.push({ icon: 'Linkedin', label: 'LinkedIn', href: personal.links.linkedin.url });
  }
  if (personal.links.email) {
    links.push({ icon: 'Mail', label: 'Email', href: `mailto:${personal.links.email.address}` });
  }
  if (personal.links.telegram) {
    links.push({ icon: 'MessageCircle', label: personal.links.telegram.username, href: personal.links.telegram.url });
  }
  
  return `"use client"

import { useState, useEffect } from "react"
import { ${links.map(l => l.icon).join(', ')} } from "lucide-react"
import { ImageCanvas } from "@/components/image-canvas"

const HALFTONE_SIZE = ${canvas?.halftoneSize ?? 0.0001}
const CONTRAST = ${canvas?.contrast ?? 1}
const ACCENT_COLOR = "${canvas?.accentColor ?? '#CECFC7'}"
const MOUSE_RADIUS = ${canvas?.mouseRadius ?? 100}
const REPULSION_STRENGTH = ${canvas?.repulsionStrength ?? 1.5}
const RETURN_SPEED = ${canvas?.returnSpeed ?? 0.6}
const ACCENT_PROBABILITY = ${canvas?.accentProbability ?? 0.2}
const SIZE_VARIATION = ${canvas?.sizeVariation ?? 0.1}

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setImage(img)
    }
    img.src = "/${personal.photo}"
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12">
        <header className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
              <div className="relative w-full max-w-lg aspect-4/3 rounded-2xl overflow-hidden border-4 border-primary shadow-2xl">
                {image ? (
                  <ImageCanvas
                    image={image}
                    halftoneSize={HALFTONE_SIZE}
                    contrast={CONTRAST}
                    accentColor={ACCENT_COLOR}
                    mouseRadius={MOUSE_RADIUS}
                    repulsionStrength={REPULSION_STRENGTH}
                    returnSpeed={RETURN_SPEED}
                    accentProbability={ACCENT_PROBABILITY}
                    sizeVariation={SIZE_VARIATION}
                  />
                ) : (
                  <div className="w-full h-full bg-card flex items-center justify-center">
                    <div className="text-muted-foreground">Loading...</div>
                  </div>
                )}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground leading-tight">
                ${escapeHtml(firstName).toUpperCase()}<br />${escapeHtml(lastName).toUpperCase()}
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-primary mb-8 font-medium">
                ${escapeHtml(personal.title)}
              </p>
              <div className="flex flex-wrap gap-4 text-sm md:text-base text-muted-foreground">
${links.map(link => {
  const attrs = link.href.startsWith('http') ? 'target="_blank"\n                  rel="noopener noreferrer"' : '';
  return `                <a
                  href="${escapeHtml(link.href)}"
                  ${attrs}
                  className="flex items-center gap-2 hover:text-primary transition-colors px-4 py-2 rounded-lg hover:bg-card"
                >
                  <${link.icon} className="w-5 h-5" />
                  ${escapeHtml(link.label)}
                </a>`;
}).join('\n')}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto space-y-16">
          <section>
            <h2 className="text-3xl font-bold mb-6 text-primary border-b-2 border-primary pb-3 inline-block">
              SUMMARY
            </h2>
            <p className="text-foreground leading-relaxed text-lg whitespace-pre-line">
              ${escapeHtml(summary)}
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-8 text-primary border-b-2 border-primary pb-3 inline-block">
              PROFESSIONAL EXPERIENCE
            </h2>
            
            <div className="space-y-10">
${experience.map(exp => `              <div className="relative pl-8 border-l-4 border-primary">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full"></div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                  <h3 className="text-2xl font-semibold text-foreground">
                    ${escapeHtml(exp.title)}
                  </h3>
                  <span className="text-primary font-medium text-lg">${escapeHtml(exp.period)}</span>
                </div>
                <p className="text-primary mb-5 font-medium text-lg">${escapeHtml(exp.company)}</p>
                <ul className="space-y-2.5 text-foreground list-none">
${exp.responsibilities.map(resp => `                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-2">▸</span>
                    <span>${escapeHtml(resp)}</span>
                  </li>`).join('\n')}
                </ul>
              </div>`).join('\n\n')}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-8 text-primary border-b-2 border-primary pb-3 inline-block">
              PROJECTS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
${projects.map(proj => {
  const spanClass = proj.span === 2 ? 'md:col-span-2' : '';
  return `              <div className="bg-card p-6 rounded-xl border-2 border-border hover:border-primary transition-colors shadow-lg ${spanClass}">
                <div className="flex flex-col mb-4">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    ${escapeHtml(proj.title)}
                  </h3>
                  <span className="text-primary font-medium">${escapeHtml(proj.period)}</span>
                </div>
${proj.description ? `                <p className="text-foreground mb-3 text-sm">${escapeHtml(proj.description.trim())}</p>` : ''}
${proj.points && proj.points.length > 0 ? `                <ul className="space-y-2 text-foreground list-none">
${proj.points.map(point => `                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1.5 text-xs">▸</span>
                    <span className="text-sm">${escapeHtml(point)}</span>
                  </li>`).join('\n')}
                </ul>` : ''}
              </div>`;
}).join('\n\n')}
            </div>
          </section>

${volunteering && volunteering.length > 0 ? `<section>
            <h2 className="text-3xl font-bold mb-6 text-primary border-b-2 border-primary pb-3 inline-block">
              VOLUNTEERING
            </h2>
            
            <div className="space-y-6">
${volunteering.map(vol => `              <div className="bg-card p-6 rounded-xl border-2 border-border shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    ${escapeHtml(vol.title)}
                  </h3>
                  <span className="text-primary font-medium">${escapeHtml(vol.period)}</span>
                </div>
                ${vol.organization ? `<p className="text-primary mb-3 font-medium text-lg">${escapeHtml(vol.organization)}</p>` : ''}
                <p className="text-foreground">
                  ${escapeHtml(vol.description)}
                </p>
${vol.link ? `                <br />
                <a href="${escapeHtml(vol.link.url)}" target="_blank" rel="noopener noreferrer" className="text-primary font-bold">${escapeHtml(vol.link.text)}</a>` : ''}
              </div>`).join('\n\n')}
            </div>
          </section>` : ''}

          <section>
            <h2 className="text-3xl font-bold mb-8 text-primary border-b-2 border-primary pb-3 inline-block">
              SKILLS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border-2 border-border shadow-lg">
                <h3 className="font-semibold text-primary mb-4 text-lg">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {[${skills.technologies.map(s => `"${escapeHtml(s)}"`).join(', ')}].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-xl border-2 border-border shadow-lg">
                <h3 className="font-semibold text-primary mb-4 text-lg">Platforms & Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {[${skills.platforms.map(s => `"${escapeHtml(s)}"`).join(', ')}].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-card p-6 rounded-xl border-2 border-border shadow-lg">
                <h3 className="font-semibold text-primary mb-4 text-lg">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {[${skills.soft.map(s => `"${escapeHtml(s)}"`).join(', ')}].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-8 text-primary border-b-2 border-primary pb-3 inline-block">
              EDUCATION
            </h2>
            
            <div className="space-y-6">
${education.map(edu => `              <div className="bg-card p-6 rounded-xl border-2 border-border shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    ${escapeHtml(edu.degree)}
                  </h3>
                  <span className="text-primary font-medium">${escapeHtml(edu.period)}</span>
                </div>
                <p className="text-muted-foreground">${escapeHtml(edu.institution)}</p>
              </div>`).join('\n\n')}
            </div>
          </section>

          <section className="pb-12">
            <h2 className="text-3xl font-bold mb-6 text-primary border-b-2 border-primary pb-3 inline-block">
              LANGUAGES
            </h2>
            
            <div className="bg-card p-6 rounded-xl border-2 border-border shadow-lg">
              <ul className="space-y-3 text-foreground list-none">
${languages.map(lang => `                <li className="flex items-center gap-3">
                  <span className="text-primary text-xl">▸</span>
                  <span className="text-lg">${escapeHtml(lang)}</span>
                </li>`).join('\n')}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
`;
}

// Generate layout.tsx
function generateLayout(resume) {
  const { personal, fonts } = resume;
  const sansFont = fonts?.sans || 'Geist';
  const monoFont = fonts?.mono || 'Geist Mono';
  
  // Convert font names to Next.js font import format (spaces become underscores)
  const sansFontImport = sansFont.replace(/\s+/g, '_');
  const monoFontImport = monoFont.replace(/\s+/g, '_');
  
  // Variable names (camelCase with underscore prefix)
  const sansFontVar = '_sans';
  const monoFontVar = '_mono';
  
  return `import type React from "react"
import type { Metadata } from "next"
import { ${sansFontImport}, ${monoFontImport} } from "next/font/google"
import "./globals.css"

const ${sansFontVar} = ${sansFontImport}({ subsets: ["latin"] })
const ${monoFontVar} = ${monoFontImport}({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "${escapeHtml(personal.name)}",
  description: "Resume Website",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={\`font-sans antialiased\`}>
        {children}
      </body>
    </html>
  )
}
`;
}

// Generate globals.css
function generateGlobalsCss(resume) {
  const colors = resume.colors || {};
  const fonts = resume.fonts || {};
  
  return `@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: ${colors.background || '#020202'};
  --foreground: ${colors.foreground || '#CECFC7'};
  --card: ${colors.card || '#1a1a1a'};
  --card-foreground: ${colors.cardForeground || '#CECFC7'};
  --popover: ${colors.popover || '#1a1a1a'};
  --popover-foreground: ${colors.popoverForeground || '#CECFC7'};
  --primary: ${colors.primary || '#3E6259'};
  --primary-foreground: ${colors.primaryForeground || '#CECFC7'};
  --secondary: ${colors.secondary || '#2a2a2a'};
  --secondary-foreground: ${colors.secondaryForeground || '#CECFC7'};
  --muted: ${colors.muted || '#2a2a2a'};
  --muted-foreground: ${colors.mutedForeground || '#9a9a9a'};
  --accent: ${colors.accent || '#3E6259'};
  --accent-foreground: ${colors.accentForeground || '#CECFC7'};
  --destructive: ${colors.destructive || '#dc2626'};
  --destructive-foreground: ${colors.destructiveForeground || '#CECFC7'};
  --border: ${colors.border || '#3E6259'};
  --input: ${colors.input || '#2a2a2a'};
  --ring: ${colors.ring || '#3E6259'};
  --chart-1: ${colors.chart1 || '#3E6259'};
  --chart-2: ${colors.chart2 || '#CECFC7'};
  --chart-3: ${colors.chart3 || '#5a7a72'};
  --chart-4: ${colors.chart4 || '#8a9a94'};
  --chart-5: ${colors.chart5 || '#a0b0aa'};
  --radius: 0.5rem;
  --sidebar: ${colors.card || '#1a1a1a'};
  --sidebar-foreground: ${colors.foreground || '#CECFC7'};
  --sidebar-primary: ${colors.primary || '#3E6259'};
  --sidebar-primary-foreground: ${colors.primaryForeground || '#CECFC7'};
  --sidebar-accent: ${colors.secondary || '#2a2a2a'};
  --sidebar-accent-foreground: ${colors.secondaryForeground || '#CECFC7'};
  --sidebar-border: ${colors.border || '#3E6259'};
  --sidebar-ring: ${colors.ring || '#3E6259'};
}

.dark {
  --background: ${colors.background || '#020202'};
  --foreground: ${colors.foreground || '#CECFC7'};
  --card: ${colors.card || '#1a1a1a'};
  --card-foreground: ${colors.cardForeground || '#CECFC7'};
  --popover: ${colors.popover || '#1a1a1a'};
  --popover-foreground: ${colors.popoverForeground || '#CECFC7'};
  --primary: ${colors.primary || '#3E6259'};
  --primary-foreground: ${colors.primaryForeground || '#CECFC7'};
  --secondary: ${colors.secondary || '#2a2a2a'};
  --secondary-foreground: ${colors.secondaryForeground || '#CECFC7'};
  --muted: ${colors.muted || '#2a2a2a'};
  --muted-foreground: ${colors.mutedForeground || '#9a9a9a'};
  --accent: ${colors.accent || '#3E6259'};
  --accent-foreground: ${colors.accentForeground || '#CECFC7'};
  --destructive: ${colors.destructive || '#dc2626'};
  --destructive-foreground: ${colors.destructiveForeground || '#CECFC7'};
  --border: ${colors.border || '#3E6259'};
  --input: ${colors.input || '#2a2a2a'};
  --ring: ${colors.ring || '#3E6259'};
  --chart-1: ${colors.chart1 || '#3E6259'};
  --chart-2: ${colors.chart2 || '#CECFC7'};
  --chart-3: ${colors.chart3 || '#5a7a72'};
  --chart-4: ${colors.chart4 || '#8a9a94'};
  --chart-5: ${colors.chart5 || '#a0b0aa'};
  --sidebar: ${colors.card || '#1a1a1a'};
  --sidebar-foreground: ${colors.foreground || '#CECFC7'};
  --sidebar-primary: ${colors.primary || '#3E6259'};
  --sidebar-primary-foreground: ${colors.primaryForeground || '#CECFC7'};
  --sidebar-accent: ${colors.secondary || '#2a2a2a'};
  --sidebar-accent-foreground: ${colors.secondaryForeground || '#CECFC7'};
  --sidebar-border: ${colors.border || '#3E6259'};
  --sidebar-ring: ${colors.ring || '#3E6259'};
}

@theme inline {
  --font-sans: "${fonts?.sans || 'Geist'}", "${fonts?.sans || 'Geist'} Fallback";
  --font-mono: "${fonts?.mono || 'Geist Mono'}", "${fonts?.mono || 'Geist Mono'} Fallback";
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;
}

// Main function
function main() {
  const resumeYamlPath = path.join(process.cwd(), 'resume.yaml');
  const appDir = path.join(process.cwd(), 'app');
  
  if (!fs.existsSync(resumeYamlPath)) {
    console.error('Error: resume.yaml not found!');
    console.error('Please copy resume.example.yaml to resume.yaml and customize it.');
    process.exit(1);
  }
  
  try {
    const resumeYaml = fs.readFileSync(resumeYamlPath, 'utf8');
    const resume = yaml.load(resumeYaml);
    
    // Create app directory if it doesn't exist
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }
    
    // Generate files
    const pageContent = generatePage(resume);
    const layoutContent = generateLayout(resume);
    const cssContent = generateGlobalsCss(resume);
    
    fs.writeFileSync(path.join(appDir, 'page.tsx'), pageContent);
    fs.writeFileSync(path.join(appDir, 'layout.tsx'), layoutContent);
    fs.writeFileSync(path.join(appDir, 'globals.css'), cssContent);
    
    console.log('✓ Generated app/page.tsx');
    console.log('✓ Generated app/layout.tsx');
    console.log('✓ Generated app/globals.css');
    console.log('\n✓ Generation complete!');
    
  } catch (error) {
    console.error('Error generating site:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generatePage, generateLayout, generateGlobalsCss };

