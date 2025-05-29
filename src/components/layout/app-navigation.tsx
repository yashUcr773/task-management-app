"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/providers/auth-provider"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Users, 
  Settings,
  Plus,
  Bell,
  Target,
  Timer
} from "lucide-react"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Teams', href: '/teams', icon: Users },
  { name: 'Epics', href: '/epics', icon: Target },
  { name: 'Sprints', href: '/sprints', icon: Timer },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function AppNavigation() {
  const pathname = usePathname()
  const { session } = useAuth()

  if (!session) return null

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <CheckSquare className="h-6 w-6" />
            <span className="font-bold">TaskFlow</span>
          </Link>
        </div>

        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? 'text-black'
                    : 'text-muted-foreground'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>        <div className="ml-auto flex items-center space-x-4">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          
          <NotificationsDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                  <AvatarFallback>
                    {session.user?.name?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => signOut()}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
