import { Video } from "@/types/intervention";

interface Props {
  video: Video;
}

function detectType(url: string, declared: string): "youtube" | "vimeo" | "file" {
  if (url.match(/youtube\.com|youtu\.be/)) return "youtube";
  if (url.match(/vimeo\.com/)) return "vimeo";
  return declared as "youtube" | "vimeo" | "file";
}

function toEmbedUrl(url: string, type: "youtube" | "vimeo" | "file"): string {
  if (type === "youtube") {
    if (url.includes("youtube.com/embed/")) return url;
    const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (short) return `https://www.youtube.com/embed/${short[1]}`;
    const watch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
    const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
    return url;
  }
  if (type === "vimeo") {
    if (url.includes("player.vimeo.com")) return url;
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;
    return url;
  }
  return url;
}

export default function VideoEmbed({ video }: Props) {
  const type = detectType(video.url, video.type);

  if (type === "youtube" || type === "vimeo") {
    return (
      <div className="rounded-lg overflow-hidden border border-border">
        <div className="relative pb-[56.25%] h-0">
          <iframe
            src={toEmbedUrl(video.url, type)}
            title={video.title}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-3 bg-surface text-sm text-muted">{video.title}</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <video controls className="w-full" preload="metadata">
        <source src={video.url} />
        Votre navigateur ne prend pas en charge l&apos;élément vidéo.
      </video>
      <div className="p-3 bg-surface text-sm text-muted">{video.title}</div>
    </div>
  );
}
