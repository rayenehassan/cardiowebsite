import { Video } from "@/types/intervention";

interface Props {
  video: Video;
}

export default function VideoEmbed({ video }: Props) {
  if (video.type === "youtube" || video.type === "vimeo") {
    return (
      <div className="rounded-lg overflow-hidden border border-border">
        <div className="relative pb-[56.25%] h-0">
          <iframe
            src={video.url}
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
        Votre navigateur ne prend pas en charge l’élément vidéo.
      </video>
      <div className="p-3 bg-surface text-sm text-muted">{video.title}</div>
    </div>
  );
}
