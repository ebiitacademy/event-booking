import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  aspectClassName?: string;
};

/**
 * External URLs from admins — use unoptimized so any https host works without
 * listing every domain in next.config.
 */
export function EventImage({
  src,
  alt,
  priority,
  className,
  aspectClassName = "aspect-[16/9]",
}: Props) {
  return (
    <div
      className={`relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 ${aspectClassName} ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        unoptimized
        priority={priority}
      />
    </div>
  );
}
