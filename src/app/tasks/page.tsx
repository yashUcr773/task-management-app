import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { TasksView } from "@/components/tasks/tasks-view"

export default async function TasksPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <TasksView />
    </div>
  )
}
