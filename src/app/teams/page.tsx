import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { TeamsView } from "@/components/teams/teams-view"

export default async function TeamsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <TeamsView />
    </div>
  )
}
