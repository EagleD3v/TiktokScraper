/*
 Node.js script to batch download TikTok videos from links listed in links.txt
 It reads comma-separated TikTok URLs from links.txt, fetches download data via tikdownloader.io API,
 extracts the TikTok CDN video URL (searching generically for any URL containing "tiktokcdn")
 and caption, then saves each video into a "videos" folder
 with a filename derived from the video caption prefixed by the original poster's @username.
 After processing all links, it empties links.txt.
 All fetch requests disable caching via headers and fetch options.
*/

import fs from 'fs/promises';
import path from 'path';

// Ensure output directory exists
const videosDir = path.resolve('./videos');
try { await fs.mkdir(videosDir, { recursive: true }); } catch {}

async function downloadTiktoks() {
  const linksFile = path.resolve('./links.txt');
  let content;
  try {
    content = await fs.readFile(linksFile, 'utf-8');
  } catch (err) {
    console.error('Error reading links.txt:', err);
    return;
  }

  // Split by commas, filter out empty entries
  const links = content.split(',').map(l => l.trim()).filter(Boolean);
  if (!links.length) {
    console.log('No links found in links.txt');
    return;
  }

  for (const link of links) {
    try {
      // Extract the TikTok username from the URL
      const userMatch = link.match(/tiktok\.com\/@([^\/]+)/);
      const username = userMatch ? userMatch[1] : 'unknown_user';

      // POST to API with no-cache
      const response = await fetch('https://tikdownloader.io/api/ajaxSearch', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        },
        body: new URLSearchParams({ q: link, lang: 'en' })
      });

      if (!response.ok) {
        console.error(`Failed to fetch download data for ${link}: ${response.statusText}`);
        continue;
      }
      const json = await response.json();
      const html = json.data;

      // Extract the CDN URL generically by finding any URL containing "tiktokcdn" and "video_mp4"
      const urlRegex = /(?:href|data-src)=["'](https?:\/\/[^"']*tiktokcdn[^"']*video_mp4[^"']*)["']/g;
      const matches = Array.from(html.matchAll(urlRegex));
      if (!matches.length) {
        console.error(`No TikTok CDN URL found for ${link}`);
        continue;
      }
      const videoUrl = decodeURIComponent(matches[0][1]);

      // Extract the caption with hashtags
      const captionMatch = html.match(/<h3>(.*?)<\/h3>/s);
      let caption = captionMatch ? captionMatch[1] : 'tiktok_video';
      caption = caption.replace(/<.*?>/g, '').replace(/\s+/g, ' ').trim();

      // Prefix caption with original poster info
      const fullTitle = `(CC @ ${username}) ${caption}`;

      // Sanitize filename: remove invalid chars, replace spaces with underscores
      const safeName = fullTitle.replace(/[^a-zA-Z0-9_\- ]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 150);
      const filePath = path.join(videosDir, `${safeName}.mp4`);

      // Download and save via ArrayBuffer, with no-cache headers
      const videoResp = await fetch(videoUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        }
      });
      if (!videoResp.ok) {
        console.error(`Failed to download video for ${link}: ${videoResp.statusText}`);
        continue;
      }
      const arrayBuffer = await videoResp.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(arrayBuffer));

      console.log(`Saved: ${filePath}`);
    } catch (err) {
      console.error(`Error processing ${link}:`, err);
    }
  }

  // Empty the links file
  try {
    await fs.writeFile(linksFile, '');
    console.log('Cleared links.txt');
  } catch (err) {
    console.error('Failed to clear links.txt:', err);
  }
}

// Run
downloadTiktoks();