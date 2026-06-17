import fs from 'fs';

const content = fs.readFileSync('./src/styles/landing.css', 'utf8');

// Find all rule blocks containing landing-nav-links or landing-navbar
const regex = /([^{}]+)\{([^{}]+)\}/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const selector = match[1].trim();
  const declarations = match[2].trim();
  if (selector.includes('landing-nav-links') || selector.includes('landing-navbar') || selector.includes('landing-logo') || selector.includes('landing-footer-logo')) {
    console.log(`Selector: ${selector}\nDeclarations:\n${declarations}\n---`);
  }
}
