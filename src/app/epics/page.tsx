"use client"

import { EpicsView } from "@/components/epics/epics-view"

export default function EpicsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Epics</h1>
        <p className="text-muted-foreground">Manage your epics and track progress across teams</p>
      </div>
      <EpicsView />
    </div>
  )
}
