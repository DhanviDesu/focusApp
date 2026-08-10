import { execSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

const audioDir = path.join(process.cwd(), 'public/audio');

const origDoodle = path.join(audioDir, 'guided_doodle_orig.m4a');
const origMeditate = path.join(audioDir, 'guided_meditation_orig.m4a');

if (!fs.existsSync(origDoodle)) {
  fs.copyFileSync(path.join(audioDir, 'guided_doodle.m4a'), origDoodle);
}
if (!fs.existsSync(origMeditate)) {
  fs.copyFileSync(path.join(audioDir, 'guided_meditation.m4a'), origMeditate);
}

console.log('--- Trimming Doodling Audio ---');
const partA = path.join(audioDir, 'doodle_partA.m4a');
const partB = path.join(audioDir, 'doodle_partB.m4a');

// Cut an extra 2 seconds off the start of Part A (start at 00:03:26)
execSync(`"${ffmpegPath}" -y -ss 00:03:26 -i "${origDoodle}" -to 00:08:16 -c copy "${partA}"`, { stdio: 'inherit' });
execSync(`"${ffmpegPath}" -y -ss 00:08:54 -i "${origDoodle}" -to 00:09:56 -c copy "${partB}"`, { stdio: 'inherit' });

const listFile = path.join(audioDir, 'concat_list.txt');
fs.writeFileSync(listFile, `file '${partA}'\nfile '${partB}'\n`);

const finalDoodle = path.join(audioDir, 'guided_doodle.m4a');
execSync(`"${ffmpegPath}" -y -f concat -safe 0 -i "${listFile}" -c copy "${finalDoodle}"`, { stdio: 'inherit' });

fs.unlinkSync(partA);
fs.unlinkSync(partB);
fs.unlinkSync(listFile);

console.log('--- Trimming Meditation Audio ---');
// Start at 00:01:57 into guided_meditation_orig.m4a
const finalMeditate = path.join(audioDir, 'guided_meditation.m4a');
execSync(`"${ffmpegPath}" -y -ss 00:01:57 -i "${origMeditate}" -c copy "${finalMeditate}"`, { stdio: 'inherit' });

console.log('--- Audio Trimming Complete! ---');
