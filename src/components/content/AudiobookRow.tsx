import { ContentItem } from "@/data/content";
import AudiobookCard from "@/components/content/AudiobookCard";

interface AudiobookRowProps {
  title: string;
  items: ContentItem[];
}

const AudiobookRow = ({ title, items }: AudiobookRowProps) => {
  return (
    <section className="mt-8">
      <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 px-4 lg:px-8">{title}</h2>
      <div
        className="overflow-x-auto scrollbar-hide px-4 lg:px-8"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-3 sm:gap-4 snap-x snap-mandatory pb-2 min-w-max">
          {items.map((item) => (
            <AudiobookCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AudiobookRow;
