"use client"

import { SprintsView } from "@/components/sprints/sprints-view"

export default function SprintsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sprints</h1>
        <p className="text-muted-foreground">Manage your sprints and track team progress</p>
      </div>
      <SprintsView />
    </div>
  )
}
