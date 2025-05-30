import { Link, useLocation } from "wouter";
import { Users, Music2, LayoutDashboard, Settings, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
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
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 