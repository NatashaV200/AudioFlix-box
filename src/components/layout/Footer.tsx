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
            <div className="flex flex-wrap gap-x-2 gap-y-2 text-xs">
              <Link to="/" className="tap-target inline-flex items-center px-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/40">Home</Link>
              <Link to="/browse" className="tap-target inline-flex items-center px-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/40">Explore</Link>
              <Link to="/library" className="tap-target inline-flex items-center px-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/40">Library</Link>
              <Link to="/profile" className="tap-target inline-flex items-center px-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/40">Profile</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Legal</h3>
            <div className="flex flex-wrap gap-x-2 gap-y-2 text-xs">
              <a href="#" className="tap-target inline-flex items-center px-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/40">Privacy</a>
              <a href="#" className="tap-target inline-flex items-center px-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/40">Terms</a>
              <a href="#" className="tap-target inline-flex items-center px-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/40">Cookies</a>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {year} AudioFlix. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <a href="#" aria-label="Twitter" className="tap-target w-11 h-11 rounded-lg bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" aria-label="Instagram" className="tap-target w-11 h-11 rounded-lg bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" aria-label="YouTube" className="tap-target w-11 h-11 rounded-lg bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="#" aria-label="GitHub" className="tap-target w-11 h-11 rounded-lg bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
