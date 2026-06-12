// Last.fm returns the same generic star PNG when no real image exists.
const LASTFM_PLACEHOLDERS = [
  '2a96cbd8b46e442fc41c2b86b821562f',
  'c6f59c1e5e7240a4c0d427abd71f3dbb',
];

export function isLastfmPlaceholder(url?: string | null): boolean {
  if (!url) return true;
  return LASTFM_PLACEHOLDERS.some(h => url.includes(h));
}

export function pickImage(images: any, preferred: string[] = ['mega', 'extralarge', 'large', 'medium']): string | null {
  if (!Array.isArray(images)) return null;
  for (const size of preferred) {
    const found = images.find((i: any) => i.size === size)?.['#text'];
    if (found && !isLastfmPlaceholder(found)) return found;
  }
  return null;
}

// Deterministic hash → HSL gradient. Inspired by CLAUDE.md "gradient from artist name hash".
export function gradientFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 60) % 360;
  return `linear-gradient(135deg, hsl(${h1} 65% 45%), hsl(${h2} 65% 30%))`;
}
