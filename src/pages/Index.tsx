import { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import HeroBanner from "@/components/content/HeroBanner";
import ContentSection from "@/components/content/ContentSection";
import ContentCard from "@/components/content/ContentCard";
import { contentData } from "@/data/content";

const Home = () => {
  const [search, setSearch] = useState("");

  const featured = contentData.find((c) => c.id === "23")!;
  const trending = contentData.filter((c) => c.category === "trending");
  const topRated = contentData.filter((c) => c.category === "top-rated");
  const newReleases = contentData.filter((c) => c.category === "new-releases");
  const audiobooks = contentData.filter((c) => c.category === "audiobooks");
  const popularVideos = contentData.filter((c) => c.category === "popular-videos");

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
          <HeroBanner item={featured} />
          <div className="-mt-20 relative z-10">
            <ContentSection title="🔥 Trending Now" items={trending} />
            <ContentSection title="⭐ Top Rated" items={topRated} />
            <ContentSection title="🆕 New Releases" items={newReleases} variant="wide" />
            <ContentSection title="🎧 Audiobooks" items={audiobooks} />
            <ContentSection title="🎬 Popular Videos" items={popularVideos} variant="wide" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
