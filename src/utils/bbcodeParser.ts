/**
 * Parse Discogs BBCode URLs to HTML links
 *
 * Example input:
 * [url=http://www.discogs.com/artist/Steve+Winwood]Steve Winwood[/url]
 *
 * Example output:
 * <a href="http://www.discogs.com/artist/Steve+Winwood" target="_blank" rel="noopener noreferrer" class="text-tron-cyan hover:text-tron-orange underline">Steve Winwood</a>
 */
export function parseBBCode(text: string): string {
  if (!text) return '';

  // Parse [url=...]text[/url] format
  const urlPattern = /\[url=(.*?)\](.*?)\[\/url\]/gi;
  let result = text.replace(urlPattern, (match, url, linkText) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-tron-cyan hover:text-tron-orange underline transition-colors">${linkText}</a>`;
  });

  // Parse [b]text[/b] format
  result = result.replace(/\[b\](.*?)\[\/b\]/gi, '<strong>$1</strong>');

  // Parse [i]text[/i] format
  result = result.replace(/\[i\](.*?)\[\/i\]/gi, '<em>$1</em>');

  // Parse [u]text[/u] format
  result = result.replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>');

  // Parse line breaks
  result = result.replace(/\n/g, '<br>');

  return result;
}
