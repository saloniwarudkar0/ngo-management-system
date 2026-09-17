export function generateAlphanumericId(length) {
    const arr = new Uint8Array(12); // 12 bytes will give us 24 hex characters
    window.crypto.getRandomValues(arr);
    return Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function removeQueryParameters(url) {
  const urlObj = new URL(url);
  urlObj.search = "";  // Clears the query parameters
  return urlObj.toString();
}


export const getFileNameFromUrl = (url) => {
    // Parse the URL
    const parsedUrl = new URL(url);
    
    // Get the pathname and decode it
    const pathname = decodeURIComponent(parsedUrl.pathname);
    
    // Split the pathname by '/' and get the last part
    const parts = pathname.split('/');
    const fileName = parts[parts.length - 1];
    
    return fileName;
  };

export const  ensureUrlSafety =(str) => {
    const sanitizedString = str.replace(/[^a-zA-Z0-9\-_]/g, '_');
    return sanitizedString;
}

export function getExtension(filename) {
    const parts = filename.split('.');
    return parts[parts.length - 1];
  }

export const getS3KeyFromUrl = (url) => {
    // Parse the URL
    const parsedUrl = new URL(url);
    
    // Get the pathname and decode it
    const pathname = decodeURIComponent(parsedUrl.pathname);
    
    // Remove the first '/' character
    const key = pathname.substring(1);
    
    return key;
  }