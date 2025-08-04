"use client";

import * as React from "react";
import {
  Calculator,
  Calendar,
  Users,
  Settings,
  User,
  ClipboardCheck,
  FileText,
  Package,
  Home,
  PieChart,
  Bell,
  Search,
  Stethoscope,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

interface CommandSearchProps {
  variant?: "admin" | "caregiver" | "reviewer";
  size?: "default" | "sm";
}

export function CommandSearch({
  variant = "admin",
  size = "default",
}: CommandSearchProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const adminCommands = [
    {
      group: "Navigation",
      items: [
        { icon: Home, label: "Dashboard", shortcut: "⌘D", href: "/admin" },
        { icon: Users, label: "Users", shortcut: "⌘U", href: "/admin/users" },
        {
          icon: ClipboardCheck,
          label: "Applications",
          shortcut: "⌘A",
          href: "/admin/applications",
        },
        {
          icon: FileText,
          label: "Careers",
          shortcut: "⌘C",
          href: "/admin/careers",
        },
        {
          icon: Users,
          label: "Patients",
          shortcut: "⌘P",
          href: "/admin/patients",
        },
        { icon: Package, label: "Packages", href: "/admin/services" },
        { icon: Calendar, label: "Scheduling", href: "/admin/scheduling" },
        { icon: PieChart, label: "Reports", href: "/admin/reports" },
      ],
    },
    {
      group: "Actions",
      items: [
        { icon: User, label: "Create User", shortcut: "⌘N" },
        { icon: ClipboardCheck, label: "New Application" },
        { icon: FileText, label: "Create Job Position" },
        {
          icon: Settings,
          label: "Settings",
          shortcut: "⌘S",
          href: "/admin/settings",
        },
      ],
    },
  ];

  const reviewerCommands = [
    {
      group: "Navigation",
      items: [
        { icon: Home, label: "Dashboard", shortcut: "⌘D", href: "/reviewer" },
        {
          icon: Users,
          label: "My Patients",
          shortcut: "⌘P",
          href: "/reviewer/patients",
        },
        { icon: Calendar, label: "Schedule", shortcut: "⌘S" },
        { icon: ClipboardCheck, label: "Tasks", shortcut: "⌘T" },
        { icon: FileText, label: "Reports", shortcut: "⌘R" },
      ],
    },
    {
      group: "Actions",
      items: [
        { icon: Stethoscope, label: "Create Review", shortcut: "⌘N" },
        { icon: User, label: "Medical Assessment" },
        { icon: Bell, label: "Notifications" },
        { icon: Settings, label: "Profile Settings" },
      ],
    },
  ];

  const caregiverCommands = [
    {
      group: "Navigation",
      items: [
        { icon: Home, label: "Dashboard", shortcut: "⌘D", href: "/caregiver" },
        { icon: Users, label: "My Patients", shortcut: "⌘P" },
        { icon: Calendar, label: "Schedule", shortcut: "⌘S" },
        { icon: ClipboardCheck, label: "Tasks", shortcut: "⌘T" },
        { icon: FileText, label: "Reports", shortcut: "⌘R" },
      ],
    },
    {
      group: "Quick Actions",
      items: [
        { icon: User, label: "Update Profile", href: "/profile" },
        { icon: ClipboardCheck, label: "Log Care Activity" },
        { icon: Calendar, label: "Request Schedule Change" },
        { icon: Bell, label: "View Notifications" },
      ],
    },
  ];

  const commands =
    variant === "admin"
      ? adminCommands
      : variant === "reviewer"
      ? reviewerCommands
      : caregiverCommands;

  const handleCommand = (href?: string) => {
    setOpen(false);
    if (href) {
      window.location.href = href;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className={`relative w-full justify-start text-sm text-muted-foreground sm:pr-12 ${
          size === "sm" ? "md:w-48 lg:w-64" : "md:w-64 lg:w-96"
        }`}
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={`Search ${
            variant === "admin"
              ? "admin panel"
              : variant === "reviewer"
              ? "reviewer portal"
              : "caregiver portal"
          }...`}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {commands.map((group, groupIndex) => (
            <React.Fragment key={group.group}>
              <CommandGroup heading={group.group}>
                {group.items.map((item, itemIndex) => (
                  <CommandItem
                    key={itemIndex}
                    onSelect={() => handleCommand((item as any).href)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    {"shortcut" in item && item.shortcut && (
                      <CommandShortcut>{item.shortcut}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              {groupIndex < commands.length - 1 && <CommandSeparator />}
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
