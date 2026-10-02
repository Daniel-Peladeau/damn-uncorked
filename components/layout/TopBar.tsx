'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useBreadcrumbLabels } from './BreadcrumbLabels'

interface TopBarProps {
  currentPath: string
}

interface Crumb {
  href: string
  label: string
}

const SEGMENT_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  wines: 'Wines',
  map: 'Winery Map',
  about: 'About',
  new: 'Add Wine',
  review: 'Review',
  edit: 'Edit',
}

function buildCrumbs(path: string, labels: Record<string, string>): Crumb[] {
  const segments = path.split('/').filter(Boolean)
  if (segments.length === 0) return [{ href: '/dashboard', label: 'Dashboard' }]

  return segments.map((segment, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    // A page-registered label wins (dynamic segments like a wine's id); until
    // it arrives — e.g. first paint of a hard load — fall back to something
    // generic rather than showing the raw uuid.
    const label =
      labels[href] ??
      SEGMENT_TITLES[segment] ??
      (segments[i - 1] === 'wines' ? 'Wine' : segment.charAt(0).toUpperCase() + segment.slice(1))
    return { href, label }
  })
}

export function TopBar({ currentPath }: TopBarProps) {
  const crumbs = buildCrumbs(currentPath, useBreadcrumbLabels())
  // On mobile, trails longer than two collapse their middle crumbs behind an
  // ellipsis so the first and current crumbs always fit on one line.
  const collapsible = crumbs.length > 2

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border bg-card px-4 md:px-6">
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((crumb, i) => {
            const isFirst = i === 0
            const isLast = i === crumbs.length - 1
            const hideOnMobile = collapsible && !isFirst && !isLast

            return (
              <Fragment key={crumb.href}>
                {!isFirst && (
                  <BreadcrumbSeparator className={hideOnMobile ? 'hidden md:block' : undefined} />
                )}
                <BreadcrumbItem className={`min-w-0 ${hideOnMobile ? 'hidden md:inline-flex' : ''}`}>
                  {isLast ? (
                    <BreadcrumbPage className="block max-w-48 truncate font-medium md:max-w-xs" title={crumb.label}>
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild className="block max-w-48 truncate md:max-w-xs">
                      <Link href={crumb.href} title={crumb.label}>
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {isFirst && collapsible && (
                  <>
                    <BreadcrumbSeparator className="md:hidden" />
                    <BreadcrumbItem className="md:hidden">
                      <BreadcrumbEllipsis />
                    </BreadcrumbItem>
                  </>
                )}
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
