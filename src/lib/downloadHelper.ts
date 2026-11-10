/**
 * Direct Browser Download Helper
 * Ensures files and links trigger the browser's native download manager (تنزيلات المتصفح)
 * and allows repeating downloads multiple times without restrictions.
 */

export function transformToDirectDownloadUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // 1. Google Drive direct download transformation
  // Format: https://drive.google.com/file/d/FILE_ID/view...
  const gDriveMatch1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch1 && gDriveMatch1[1]) {
    return `https://drive.google.com/uc?export=download&id=${gDriveMatch1[1]}&confirm=t`;
  }

  // Format: https://drive.google.com/open?id=FILE_ID
  const gDriveMatch2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch2 && gDriveMatch2[1]) {
    return `https://drive.google.com/uc?export=download&id=${gDriveMatch2[1]}&confirm=t`;
  }

  // Format: https://drive.google.com/uc?...id=FILE_ID
  const gDriveMatch3 = url.match(/drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch3 && gDriveMatch3[1]) {
    return `https://drive.google.com/uc?export=download&id=${gDriveMatch3[1]}&confirm=t`;
  }

  // 2. Dropbox direct download transformation
  if (url.includes('dropbox.com')) {
    if (url.includes('dl=0')) {
      return url.replace('dl=0', 'dl=1');
    }
    if (!url.includes('dl=1')) {
      return url.includes('?') ? `${url}&dl=1` : `${url}?dl=1`;
    }
  }

  // 3. OneDrive direct download transformation
  if (url.includes('onedrive.live.com') && !url.includes('download=1')) {
    return url.includes('?') ? `${url}&download=1` : `${url}?download=1`;
  }

  return url;
}

export function generateSuggestedFilename(title: string, version: string = '1.0.0', url: string = ''): string {
  // Extract extension if present in URL
  const extMatch = url.match(/\.([a-zA-Z0-9]{2,5})(?:\?|#|$)/i);
  const ext = extMatch ? `.${extMatch[1]}` : '.apk';

  // Sanitize title for filename
  const cleanTitle = title
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_');

  const cleanVersion = version.trim().replace(/[^a-zA-Z0-9._-]/g, '');

  return `${cleanTitle || 'game'}_v${cleanVersion || '1.0.0'}${ext}`;
}

/**
 * Triggers an instant download directly in the user's browser download manager.
 * Can be called multiple times without locking or blocking.
 */
export async function initiateBrowserDownload(
  rawUrl: string,
  title: string,
  version: string = '1.0.0'
): Promise<{ success: boolean; directUrl: string; filename: string }> {
  const directUrl = transformToDirectDownloadUrl(rawUrl);
  const filename = generateSuggestedFilename(title, version, directUrl);

  // Trigger browser download via anchor element
  // Setting target="_blank" allows file downloads to be caught natively by the browser download manager
  // without replacing the active application window or failing cross-origin iframe security.
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = directUrl;
  anchor.download = filename;
  anchor.setAttribute('download', filename);
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';

  document.body.appendChild(anchor);
  anchor.click();

  setTimeout(() => {
    try {
      if (document.body.contains(anchor)) {
        document.body.removeChild(anchor);
      }
    } catch {}
  }, 2000);

  return { success: true, directUrl, filename };
}
