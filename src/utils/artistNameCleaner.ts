/**
 * Clean artist names by removing Discogs disambiguators
 *
 * Examples:
 * "Haim (2)" -> "Haim"
 * "Justice (3)" -> "Justice"
 * "The Beatles" -> "The Beatles" (unchanged)
 */
export function cleanArtistName(artistName: string): string {
  if (!artistName) return '';

  // Remove Discogs disambiguator pattern: " (number)" at the end
  return artistName.replace(/\s+\(\d+\)$/, '').trim();
}
