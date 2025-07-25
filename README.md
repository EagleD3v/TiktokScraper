# TikTok Batch Downloader

A Node.js script that batch-downloads TikTok videos from links listed in `links.txt`. It uses the TikDownloader API (`tikdownloader.io`) to fetch video data, extracts the TikTok CDN video URL and caption, and saves each video into a `videos` directory with a filename derived from the video’s caption and original poster’s username.

## Features

* Reads comma-separated TikTok URLs from `links.txt`.
* Fetches download data from the TikDownloader API with no caching.
* Extracts the TikTok CDN MP4 URL.
* Parses and sanitizes video captions (including hashtags).
* Prefixes filenames with the original poster’s `@username`.
* Saves videos in a `videos/` folder.
* Clears `links.txt` after processing.

## Prerequisites

* [Node.js](https://nodejs.org/) v14 or higher
* NPM (comes with Node.js) or Yarn

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/EagleD3v/TiktokScraper.git tiktok-scraper
   cd tiktok-scraper
   ```

2. **Install dependencies** (if any additional packages are required in the future):

   ```bash
   npm install
   ```

## Setup

1. **Create a `links.txt` file** in the root directory.

2. **Add TikTok video URLs**, separated by commas. For example:

   ```text
   https://www.tiktok.com/@user1/video/12345,https://www.tiktok.com/@user2/video/67890
   ```

3. **Ensure write permissions** for creating the `videos/` directory and writing files.

## Usage

Run the script with Node.js:

```bash
node index.js
```

* The script reads `links.txt`, processes each URL, downloads the video, and saves it to `videos/`.
* After completion, `links.txt` will be cleared automatically.

## File Structure

```
├── index.js        # Main script
├── links.txt       # Comma-separated TikTok URLs
├── videos/         # Downloaded videos output
└── README.md       # This documentation
```

## Customization

* **API Endpoint**: You can switch to another TikTok downloader API by updating the `fetch` URL in `index.js`.
* **Output Directory**: Change the `videosDir` variable at the top of the script.
* **Filename Format**: Adjust the `fullTitle` template to modify prefixing or caption formatting.

## Troubleshooting

* **Error reading `links.txt`**: Ensure the file exists and is readable.
* **No TikTok CDN URL found**: The API may have changed its HTML structure. Update the regex in `urlRegex`.
* **Failed to download video**: Check network connectivity and API availability.

## License

MIT © EagleD3v

---
