export function extractGroupIdFromUrl(url: string): string | null {
  if (!url) return null;
  // Lấy phần sau 'k/#', có thể là @username hoặc -4943686852
  const match = url.match(/k\/#([@\-\w]+)/);
  return match ? match[1] : null;
}
