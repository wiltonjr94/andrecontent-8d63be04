/** Converts supported media URLs into an embeddable iframe src. */
export function toEmbed(url?: string | null): string | null {
  if (!url) return null;

  // YouTube (watch, embed, shorts, youtu.be)
  const yt = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );

  if (yt) {
    return `https://www.youtube.com/embed/${yt[1]}`;
  }

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/);

  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
  }

  // Instagram
  const ig = url.match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/);

  if (ig) {
    return `https://www.instagram.com/p/${ig[1]}/embed`;
  }

  // Google Drive
  const drive = url.match(
    /drive\.google\.com\/file\/d\/([^/]+)/
  );

  if (drive) {
    return `https://drive.google.com/file/d/${drive[1]}/preview`;
  }

  return null;
}
