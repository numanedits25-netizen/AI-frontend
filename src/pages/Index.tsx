import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "next-themes";
import logo from "@/assets/logo.png";
import { Menu, X, Sun, Moon, Monitor } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const sampleThumbnails = ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=180&fit=crop", "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=180&fit=crop", "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=640&h=360&fit=crop"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="AI Influencer Studio" className="h-8 sm:h-10" />
          </Link>

          <nav className="hidden md:flex gap-6 text-muted-foreground font-medium">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </nav>

          <div className="hidden md:flex gap-3 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {theme === "light" ? <Sun className="h-4 w-4" /> : theme === "dark" ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/auth">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 hover:bg-accent/50 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <nav className="flex flex-col gap-2 p-4">
              <a href="#features" className="px-4 py-3 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="px-4 py-3 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
                <div className="flex gap-2 mb-2">
                  <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")} className="flex-1">
                    <Sun className="h-4 w-4 mr-2" />Light
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")} className="flex-1">
                    <Moon className="h-4 w-4 mr-2" />Dark
                  </Button>
                </div>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(190,80,255,0.1),transparent_50%)] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(80,210,255,0.1),transparent_50%)]" />
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
          <div className="text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Create Professional AI Images & <span className="bg-gradient-primary bg-clip-text text-transparent">Influencer Portraits</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
              Generate stunning influencer-style portraits and professional images with AI. 
              Perfect for content creators, marketers, and social media.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/editor" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 sm:px-12 py-6 text-base sm:text-lg bg-gradient-primary hover:shadow-glow transition-all duration-300">
                  Start Creating
                </Button>
              </Link>
            </div>

            <div className="mt-6 text-xs sm:text-sm text-muted-foreground">
              🆓 Free Plan Available • ⚡ Fast AI • 🎨 Professional Quality
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md md:max-w-none">
              <img src={sampleThumbnails[0]} alt="AI Thumbnail Example 1" className="rounded-lg sm:rounded-xl shadow-glow border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105 w-full h-auto object-cover" />
              <img src={sampleThumbnails[1]} alt="AI Thumbnail Example 2" className="rounded-lg sm:rounded-xl shadow-glow border-2 border-accent/20 hover:border-accent/50 transition-all duration-300 hover:scale-105 w-full h-auto object-cover" />
              <img src={sampleThumbnails[2]} alt="AI Thumbnail Example 3" className="rounded-lg sm:rounded-xl shadow-glow border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105 col-span-2 w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </div>


      {/* Pricing Section */}
      <div id="pricing" className="bg-background py-12 sm:py-16 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
          Choose Your Plan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <div className="border border-border rounded-2xl shadow-card p-8 flex flex-col bg-card">
            <h3 className="text-xl font-bold mb-4">🆓 Free Plan</h3>
            <p className="mb-6 text-muted-foreground">Generate <b className="text-foreground">6 images per day</b></p>
            <p className="text-3xl font-bold mb-6">$0</p>
            <ul className="mb-6 space-y-2 text-muted-foreground">
              <li>✔ 6 images/day</li>
              <li>✔ Standard quality</li>
              <li>✔ AI Influencers & Image Generator</li>
            </ul>
            <Button className="mt-auto">Get Started</Button>
          </div>

          <div className="border-2 border-primary rounded-2xl shadow-glow p-8 flex flex-col bg-gradient-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-primary opacity-5" />
            <h3 className="text-xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent relative z-10">🔥 Pro Plan</h3>
            <p className="mb-6 text-muted-foreground relative z-10">Generate <b className="text-foreground">Unlimited images</b></p>
            <p className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent relative z-10">$5</p>
            <p className="text-muted-foreground mb-6 relative z-10">Per month</p>
            <p className="text-xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent relative z-10">$30</p>
            <p className="text-muted-foreground mb-6 relative z-10">Per year</p>
            <ul className="mb-6 space-y-2 text-muted-foreground relative z-10">
              <li>✔ Unlimited images</li>
              <li>✔ Full HD quality</li>
              <li>✔ AI Influencers & Image Generator</li>
              <li>✔ Logo + Branding support</li>
              <li>✔ Priority support</li>
            </ul>
            <Button className="mt-auto bg-gradient-primary hover:shadow-glow transition-all duration-300 relative z-10">
              Go Pro
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm sm:text-base text-muted-foreground">
          <p>© 2025 AI Influencer Studio. Create professional AI images and influencer portraits.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;