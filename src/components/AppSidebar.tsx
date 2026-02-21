import { LayoutDashboard, Sparkles } from 'lucide-react';

interface AppSidebarProps {
  onOpenChat: () => void;
}

export function AppSidebar({ onOpenChat }: AppSidebarProps) {
  return (
    <aside className="w-16 bg-[hsl(var(--sidebar-background))] flex flex-col items-center py-6 gap-6 shrink-0">
      {/* Logo */}
      <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center mb-4">
        <span className="text-primary-foreground font-bold text-lg">K</span>
      </div>

      {/* Nav icons */}
      <button
        className="h-10 w-10 rounded-xl bg-[hsl(var(--sidebar-accent))] flex items-center justify-center text-[hsl(var(--sidebar-primary))] transition-colors"
        title="Board"
      >
        <LayoutDashboard className="h-5 w-5" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* AI Chat button */}
      <button
        onClick={onOpenChat}
        className="h-10 w-10 rounded-xl bg-primary/20 hover:bg-primary/30 flex items-center justify-center text-[hsl(var(--sidebar-primary))] transition-colors"
        title="AI Assistant"
      >
        <Sparkles className="h-5 w-5" />
      </button>
    </aside>
  );
}
