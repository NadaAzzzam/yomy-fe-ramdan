#!/usr/bin/env node
/**
 * Build Android App Bundle (AAB) for Play Store.
 * Cross-platform: runs gradlew.bat on Windows, ./gradlew on Unix.
 * Copies the AAB to project root: release/app-release.aab
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isWindows = process.platform === 'win32';
const gradleCmd = isWindows ? '.\\gradlew.bat bundleRelease' : './gradlew bundleRelease';
const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const aabFrom = path.join(androidDir, 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
const releaseDir = path.join(rootDir, 'release');
const aabTo = path.join(releaseDir, 'app-release.aab');

console.log('Building Android App Bundle (AAB) for production...');
execSync(gradleCmd, {
  cwd: androidDir,
  stdio: 'inherit',
});

if (!fs.existsSync(aabFrom)) {
  console.error('Error: AAB not found at', aabFrom);
  process.exit(1);
}

if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}
fs.copyFileSync(aabFrom, aabTo);

console.log('Done. AAB copied to: release/app-release.aab');
console.log('Full path:', path.resolve(aabTo));
