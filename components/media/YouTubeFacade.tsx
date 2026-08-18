'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Lightweight YouTube facade (CLAUDE.md §5.6).
 *
 * On load this is a poster image and a play button — roughly 30KB instead of
 * the ~1MB of JavaScript an embedded player pulls in. The real iframe is only
 * created once the visitor actually clicks, and it autoplays so the click is
 * not wasted. `youtube-nocookie.com` keeps tracking off until then.
 */
export default function YouTubeFacade({
  youtubeId,
  title,
  className,
}: {
  youtubeId: string;
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={cn(
        'relative aspect-video overflow-hidden border border-line bg-ink',
        className,
      )}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 h-full w-full"
        >
          <Image
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            loading="lazy"
            className="object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-90"
          />

          {/* Play target, drawn as a registration mark. */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-cyan transition-transform duration-300 ease-press group-hover:scale-110" />
              <span className="absolute inset-0 translate-x-1 rounded-full border border-magenta transition-transform duration-300 ease-press group-hover:translate-x-0" />
              <Play
                aria-hidden="true"
                className="relative h-5 w-5 translate-x-[1px] fill-paper text-paper"
              />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
