// run-subzy.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runSubzy(target) {
  return new Promise((resolve, reject) => {
    let subzyPath = process.env.SUBZY || 'subzy';

    // Fallback to GOPATH/bin if not found in PATH and if subzyPath looks like a path
    if (!fs.existsSync(subzyPath)) {
      const goBin = path.join(process.env.GOPATH || path.join(process.env.HOME || '', 'go'), 'bin', 'subzy');
      if (fs.existsSync(goBin)) subzyPath = goBin;
    }

    const args = ['run', '--target', target, '--timeout', '5'];
    const issues = [];

    const child = spawn(subzyPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', chunk => {
      chunk.split(/\r?\n/).forEach(line => {
        if (!line) return;

        // Remove ANSI color codes and trim
        const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '').trim();
        if (!cleanLine) return;

        // Normalize for checks
        const upper = cleanLine.toUpperCase();

        // Skip common non-issue lines
        const skippedPatterns = [
          'NOT VULNERABLE',
          'SHOW ONLY POTENTIALLY VULNERABLE SUBDOMAINS',
          '--HIDE_FAILS',
          '[ NO ]'
        ];
        if (skippedPatterns.some(p => upper.includes(p))) return;

        // Accept only lines that indicate an actual vulnerability or takeover
        if (/VULNERABLE\b/i.test(cleanLine) || /Takeover/i.test(cleanLine)) {
          issues.push(cleanLine);
        }
      });
    });

    child.stderr.on('data', chunk => {
      chunk.split(/\r?\n/).forEach(line => {
        if (!line) return;
        console.error('[subzy stderr]', line);
      });
    });

    child.on('error', err => {
      reject(new Error(`Failed to start subzy: ${err.message}`));
    });

    child.on('close', code => {
      resolve(issues);
    });
  });
}

module.exports = runSubzy;
