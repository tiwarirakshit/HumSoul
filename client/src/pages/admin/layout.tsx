import { Link, useLocation } from "wouter";
import { Users, Music2, LayoutDashboard, Settings, Crown, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Music', href: '/admin/music', icon: Music2 },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: Crown },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
              <div className="flex h-16 shrink-0 items-center justify-between">
                <h1 className="text-2xl font-bold">HumSoul Admin</h1>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => {
                        const isActive = location === item.href;
                        return (
                          <li key={item.name}>
                            <Link href={item.href}>
                              <a
                                className={cn(
                                  isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <item.icon
                                  className={cn(
                                    'h-6 w-6 shrink-0',
                                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </a>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                  <li className="mt-auto">
                    <button
                      onClick={handleLogout}
                      className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-muted-foreground hover:text-foreground hover:bg-muted w-full"
                    >
                      <LogOut
                        className="h-6 w-6 shrink-0 text-muted-foreground group-hover:text-foreground"
                        aria-hidden="true"
                      />
                      Logout
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold">HumSoul Admin</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <li key={item.name}>
                        <Link href={item.href}>
                          <a
                            className={cn(
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                            )}
                          >
                            <item.icon
                              className={cn(
                                'h-6 w-6 shrink-0',
                                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </a>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <button
                  onClick={handleLogout}
                  className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-muted-foreground hover:text-foreground hover:bg-muted w-full"
                >
                  <LogOut
                    className="h-6 w-6 shrink-0 text-muted-foreground group-hover:text-foreground"
                    aria-hidden="true"
                  />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-white dark:bg-card px-4 shadow-md sm:gap-x-6 sm:px-6 lg:hidden w-full" style={{paddingTop: 'env(safe-area-inset-top, 12px)'}}>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 truncate flex items-center justify-center">
          <h1 className="text-xl font-bold truncate">HumSoul Admin</h1>
        </div>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut className="h-6 w-6" />
        </button>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 pt-16 lg:pt-0" style={{paddingTop: 'calc(4rem + env(safe-area-inset-top, 12px))'}}>
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}