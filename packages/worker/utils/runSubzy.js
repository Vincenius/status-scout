import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

async function runSubzy(target) {
  return new Promise((resolve, reject) => {
    // Basic validation: ensure we have a target string
    if (!target || typeof target !== 'string' || !target.trim()) {
      // nothing to scan
      return resolve([]);
    }
    let subzyPath = process.env.SUBZY || 'subzy';

    // Fallback to GOPATH/bin if not found in PATH and if subzyPath looks like a path
    if (!fs.existsSync(subzyPath)) {
      const goBin = path.join(process.env.GOPATH || path.join(process.env.HOME || '', 'go'), 'bin', 'subzy');
      if (fs.existsSync(goBin)) subzyPath = goBin;
    }

    const args = ['run', '--target', target, '--timeout', '5'];
    const issues = [];

    console.log(`Running command: ${subzyPath} ${args.join(' ')}`);

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

    // Collect stderr but ignore the common "usage" / help output and EOF noise
    const stderrLines = [];
    child.stderr.on('data', chunk => {
      chunk.split(/\r?\n/).forEach(line => {
        if (!line) return;

        // Remove ANSI color codes and trim
        const clean = line.replace(/\x1b\[[0-9;]*m/g, '').trim();
        if (!clean) return;

        stderrLines.push(clean);

        // Filter out the subzy usage/help text and the common "Error: EOF" noise
        const isUsageNoise = /^(Usage:|Aliases:|Flags:|--\w+\s)/i.test(clean) || /Error:\s*EOF/i.test(clean) || /subzy run \[flags\]/i.test(clean);
        if (isUsageNoise) return;

        // Log anything else as actual stderr
        console.error('[subzy stderr]', clean);
      });
    });

    child.on('error', err => {
      reject(new Error(`Failed to start subzy: ${err.message}`));
    });

    child.on('close', code => {
      // If stderr only contained usage/help or EOF noise, don't treat it as an actionable error.
      const nonNoise = stderrLines.filter(l => !/^(Usage:|Aliases:|Flags:|--\w+\s)/i.test(l) && !/Error:\s*EOF/i.test(l) && !/subzy run \[flags\]/i.test(l));
      if (nonNoise.length > 0) {
        nonNoise.forEach(l => console.error('[subzy stderr]', l));
      }

      resolve(issues);
    });
  });
}

export default runSubzy;
