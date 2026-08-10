import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

const inputFile = path.join(process.cwd(), 'public/audio/focus_music.mp4');
const audioDir = path.join(process.cwd(), 'public/audio');

if (!fs.existsSync(inputFile)) {
  console.error('Source audio file focus_music.mp4 not found');
  process.exit(1);
}

const sections = [
  { name: 'focus_section_1.m4a', start: '00:01:07', duration: '00:50:00' },
  { name: 'guided_doodle.m4a', start: '00:51:07', duration: '00:10:00' },
  { name: 'focus_section_2.m4a', start: '01:01:07', duration: '00:50:00' },
  { name: 'guided_meditation.m4a', start: '01:51:07', duration: '00:10:00' },
  { name: 'focus_section_3.m4a', start: '02:01:07', duration: '00:50:00' }
];

console.log('Starting audio section extraction...');

sections.forEach(sec => {
  const outputPath = path.join(audioDir, sec.name);
  console.log(`Extracting ${sec.name} from ${sec.start} (${sec.duration})...`);
  
  // Fast stream copy without re-encoding (-c copy)
  const cmd = `"${ffmpegPath}" -y -ss ${sec.start} -i "${inputFile}" -t ${sec.duration} -c copy "${outputPath}"`;
  execSync(cmd, { stdio: 'inherit' });
});

console.log('Audio section extraction completed successfully!');
