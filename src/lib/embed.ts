/** Converts supported media URLs into an embeddable iframe src. */
export function toEmbed(url?: string | null): string | null {
  if (!url) return null;

  // YouTube
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtu.be")
    ) {
      let id = "";

      if (parsed.hostname.includes("youtu.be")) {
        id = parsed.pathname.replace("/", "");
      } else if (parsed.searchParams.get("v")) {
        id = parsed.searchParams.get("v")!;
      } else {
        const parts = parsed.pathname.split("/");
        id = parts[parts.length - 1];
      }

      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }
  } catch {}

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

  // Google Drive (todos os formatos)

  let match = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);

  if (!match) {
    match = url.match(/[?&]id=([^&]+)/);
  }

  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }

  return null;
}
