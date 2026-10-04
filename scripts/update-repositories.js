const fs = require('fs');
const path = require('path');

const USERNAME = 'harsha895155';
const README_PATH = path.join(__dirname, '..', 'README.md');

// Fallback descriptions in case GitHub repo description is empty
const DESCRIPTIONS = {
  'Hollow': 'Production-Grade Financial Intelligence, Expense Tracker & PWA Mobile App',
  'VIDESTORE': 'Full-Stack Fashion E-Commerce Platform inspired by Zara/Nike with Razorpay & Cloudinary',
  'FineTech': 'FinTech Banking Dashboard with hardened JWT authentication & bcrypt security',
  'Digital-Notes-Management-System': 'Digital Notes Management System web application',
  'portfolio': 'Personal developer portfolio website showcasing projects and certifications',
  'blog_folut-main': 'Full-featured blogging platform built with Django 4.2, AJAX reactions, and AWS S3',
  'AirGuard': 'IoT Air Quality Monitoring System with ESP32, Node.js API, and React dashboard'
};

const TECH_BADGES = {
  'JavaScript': 'https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black',
  'TypeScript': 'https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white',
  'Python': 'https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white',
  'HTML': 'https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white',
  'CSS': 'https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white',
  'C++': 'https://img.shields.io/badge/C++-00599C?style=flat-square&logo=c%2B%2B&logoColor=white',
  'Java': 'https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=openjdk&logoColor=white'
};

async function fetchRepos() {
  const headers = {
    'User-Agent': 'Node.js-Auto-Sync-Script',
    'Accept': 'application/vnd.github.v3+json'
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch repos: ${response.status} ${response.statusText}`);
  }

  const repos = await response.json();
  return repos;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
}

function buildMarkdown(repos) {
  // Filter out the profile repo itself
  const filtered = repos.filter(r => r.name.toLowerCase() !== USERNAME.toLowerCase());

  let table = `| Repository | Description | Language | Live Demo | Stars / Forks | Last Active |\n`;
  table += `|:---|:---|:---:|:---:|:---:|:---:|\n`;

  for (const repo of filtered) {
    const name = `[**${repo.name}**](${repo.html_url})`;
    const desc = repo.description || DESCRIPTIONS[repo.name] || 'Full-stack software development project';
    
    let lang = repo.language || '—';
    if (TECH_BADGES[repo.language]) {
      lang = `![${repo.language}](${TECH_BADGES[repo.language]})`;
    }

    const demo = repo.homepage 
      ? `[🔗 Live Demo](${repo.homepage})` 
      : '—';

    const starsForks = `⭐ ${repo.stargazers_count} &nbsp;|&nbsp; 🍴 ${repo.forks_count}`;
    const lastActive = formatDate(repo.pushed_at || repo.updated_at);

    // Escape pipe characters in description to prevent table breaking
    const cleanDesc = desc.replace(/\|/g, '-');

    table += `| ${name} | ${cleanDesc} | ${lang} | ${demo} | ${starsForks} | \`${lastActive}\` |\n`;
  }

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });

  return `<!-- REPOSITORIES:START -->\n\n> 🤖 *Automatically synced with GitHub API daily at 00:00 UTC · Last synced: **${today}***\n\n${table}\n<!-- REPOSITORIES:END -->`;
}

async function main() {
  console.log(`Fetching repositories for ${USERNAME}...`);
  const repos = await fetchRepos();
  console.log(`Fetched ${repos.length} repositories.`);

  const generatedMarkdown = buildMarkdown(repos);

  if (!fs.existsSync(README_PATH)) {
    console.error(`README not found at ${README_PATH}`);
    process.exit(1);
  }

  let readme = fs.readFileSync(README_PATH, 'utf8');

  const startMarker = '<!-- REPOSITORIES:START -->';
  const endMarker = '<!-- REPOSITORIES:END -->';

  if (readme.includes(startMarker) && readme.includes(endMarker)) {
    const startIndex = readme.indexOf(startMarker);
    const endIndex = readme.indexOf(endMarker) + endMarker.length;
    readme = readme.substring(0, startIndex) + generatedMarkdown + readme.substring(endIndex);
  } else {
    // Append section if markers don't exist yet
    readme += `\n\n---\n\n## 📂 All Public Repositories (Auto-Updated Daily)\n\n${generatedMarkdown}\n`;
  }

  fs.writeFileSync(README_PATH, readme, 'utf8');
  console.log('Successfully updated README.md with latest repository information!');
}

main().catch(err => {
  console.error('Error updating repositories:', err);
  process.exit(1);
});
