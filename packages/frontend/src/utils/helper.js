export const normalizeUrl = (value) => {
  // If user entered without scheme, default to https
  if (!/^https?:\/\//i.test(value)) {
    return `https://${value}`;
  }
  return value;
}

export const isValidUrl = (value) => {
  try {
    const url = new URL(normalizeUrl(value));
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    const hasValidHostname =
      /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname) ||
      /^[\d.]+$/.test(url.hostname);

    return isHttp && hasValidHostname;
  } catch (_) {
    return false;
  }
}
