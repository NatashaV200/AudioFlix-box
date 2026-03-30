import { Link } from "react-router-dom";
import { Github, Instagram, Youtube, Twitter } from "lucide-react";

interface FooterProps {
  className?: string;
}

const Footer = ({ className = "" }: FooterProps) => {
  const year = new Date().getFullYear();

  return (
    <footer className={`border-t border-border/50 bg-background/70 backdrop-blur-xl ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">AudioFlix</h3>
            <p className="text-xs text-muted-foreground">Immersive listening and social audio experiences.</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Links</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
              <Link to="/browse" className="text-muted-foreground hover:text-foreground">Explore</Link>
              <Link to="/library" className="text-muted-foreground hover:text-foreground">Library</Link>
              <Link to="/profile" className="text-muted-foreground hover:text-foreground">Profile</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Legal</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Cookies</a>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {year} AudioFlix. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-lg bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-lg bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" aria-label="YouTube" className="w-8 h-8 rounded-lg bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="#" aria-label="GitHub" className="w-8 h-8 rounded-lg bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
