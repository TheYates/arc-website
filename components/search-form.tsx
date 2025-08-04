"use client"

import * as React from "react"
import { Search, FileText, Users, Package, Calendar, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"

export function SearchForm({ ...props }: React.ComponentProps<"div">) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <div {...props}>
      <Button
        variant="outline"
        className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search admin...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin"))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin/applications"))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Applications</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin/patients"))}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Patients</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin/services"))}
            >
              <Package className="mr-2 h-4 w-4" />
              <span>Services</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin/users"))}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Users</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin/applications"))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>View Applications</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin/patients"))}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Manage Patients</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/admin/services"))}
            >
              <Package className="mr-2 h-4 w-4" />
              <span>Configure Services</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
