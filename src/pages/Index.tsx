import { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import FeaturedAudiobookCarousel from "@/components/content/FeaturedAudiobookCarousel";
import AudiobookRow from "@/components/content/AudiobookRow";
import ContentCard from "@/components/content/ContentCard";
import { contentData } from "@/data/content";

const Home = () => {
  const [search, setSearch] = useState("");

  const audiobooks = contentData.filter((c) => c.type === "audio");
  const featuredAudiobooks = [...audiobooks]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 5);
  const trendingAudiobooks = audiobooks
    .filter((c) => c.category === "trending" || c.category === "audiobooks")
    .slice(0, 12);
  const topRatedAudiobooks = [...audiobooks]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 12);
  const newAudiobooks = audiobooks
    .filter((c) => c.category === "new-releases" || c.category === "audiobooks")
    .slice(0, 12);

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return contentData.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.genre?.toLowerCase().includes(q) ||
        c.type.includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearchChange={setSearch} showSearch searchValue={search} />
      <Sidebar />

      {filtered ? (
        <div className="pt-20 pb-12 max-w-[1440px] mx-auto px-4 lg:px-8 md:pl-24">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">
            Results for &ldquo;{search}&rdquo;
          </h2>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">No content found.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
              {filtered.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="md:pl-24">
          <FeaturedAudiobookCarousel items={featuredAudiobooks} />
          <div className="-mt-6 relative z-10 pb-8">
            <AudiobookRow title="🔥 Trending Audiobooks" items={trendingAudiobooks} />
            <AudiobookRow title="⭐ Top Rated" items={topRatedAudiobooks} />
            <AudiobookRow title="🆕 New Releases" items={newAudiobooks} />
          </div>
        </div>
      )}

      <Footer className="md:pl-24" />
    </div>
  );
};

export default Home;
