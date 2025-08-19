"use client";

import * as React from "react";

import { SearchForm } from "@/components/search-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface AdminHeaderProps {
  breadcrumbs?: {
    title: string;
    href?: string;
  }[];
}

export function AdminHeader({ breadcrumbs = [] }: AdminHeaderProps) {
  return (
    <header className="bg-background fixed top-0 left-0 right-0 z-50 flex w-full items-center border-b">
      <div className="flex h-12 w-full items-center gap-2 px-4">
        <SidebarTrigger className="hidden md:inline-flex" />
        <Separator
          orientation="vertical"
          className="mr-2 h-4 hidden md:block"
        />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.title}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="ml-auto w-[200px] sm:w-[260px] md:w-[320px]" />
      </div>
    </header>
  );
}
