import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

const playlistDir = path.join(process.cwd(), 'public/audio/spotify_playlist');
const outputFile = path.join(process.cwd(), 'public/audio/spotify_focus_mix.m4a');
const listFile = path.join(playlistDir, 'concat_list.txt');

if (!fs.existsSync(playlistDir)) {
  console.error('Playlist folder not found.');
  process.exit(1);
}

const files = fs.readdirSync(playlistDir)
  .filter(f => f.endsWith('.m4a'))
  .sort();

console.log(`Found ${files.length} downloaded tracks to compile.`);

if (files.length === 0) {
  console.log('No tracks found yet.');
  process.exit(0);
}

const lines = files.map(f => `file '${path.join(playlistDir, f)}'`).join('\n');
fs.writeFileSync(listFile, lines);

console.log('Concatenating playlist tracks into spotify_focus_mix.m4a...');
const cmd = `"${ffmpegPath}" -y -f concat -safe 0 -i "${listFile}" -c copy "${outputFile}"`;
execSync(cmd, { stdio: 'inherit' });

console.log('Spotify focus mix compilation complete!');
