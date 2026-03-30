import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

interface SidebarPlaceholderProps {
  title: string;
  description: string;
}

const SidebarPlaceholder = ({ title, description }: SidebarPlaceholderProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className="pt-20 pb-12 px-4 lg:px-8 md:pl-24">
        <div className="max-w-4xl mx-auto rounded-2xl border border-border/50 bg-card p-6 md:p-8 card-shine animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{title}</h1>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>
      </main>
    </div>
  );
};

export default SidebarPlaceholder;
