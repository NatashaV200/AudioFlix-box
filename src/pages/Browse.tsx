import { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ContentCard from "@/components/content/ContentCard";
import { contentData } from "@/data/content";
import { Search, SlidersHorizontal } from "lucide-react";

const Browse = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "audio" | "video">("all");

  const filtered = useMemo(() => {
    let items = contentData;
    if (typeFilter !== "all") {
      items = items.filter((c) => c.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.genre?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [search, typeFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className="pt-20 pb-12 max-w-[1440px] mx-auto px-4 lg:px-8 md:pl-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Browse
          </h1>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center bg-secondary rounded-xl px-3 py-2.5 gap-2 flex-1 sm:w-72">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search titles, genres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            {/* Filter */}
            <div className="flex items-center bg-secondary rounded-xl overflow-hidden">
              {(["all", "audio", "video"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    typeFilter === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <SlidersHorizontal className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No results found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
            {filtered.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Browse;
