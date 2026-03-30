import { ContentItem } from "@/data/content";
import AudiobookCard from "@/components/content/AudiobookCard";

interface AudiobookRowProps {
  title: string;
  items: ContentItem[];
  isLoading?: boolean;
}

const AudiobookRow = ({ title, items, isLoading = false }: AudiobookRowProps) => {
  // Show 4 skeleton cards while loading
  const skeletonCount = 4;

  return (
    <section className="mt-8">
      <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 px-4 lg:px-8">{title}</h2>
      <div
        className="overflow-x-auto scrollbar-hide px-4 lg:px-8"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-3 sm:gap-4 snap-x snap-mandatory pb-2 min-w-max">
          {isLoading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <AudiobookCard key={`skeleton-${i}`} item={{ id: "", title: "", type: "audio", src: "", thumbnail: "" }} isLoading={true} />
              ))
            : items.map((item) => (
                <AudiobookCard key={item.id} item={item} isLoading={false} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default AudiobookRow;
