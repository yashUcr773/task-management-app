import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { CalendarView } from "@/components/calendar/calendar-view"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calendar | Task Management",
  description: "View and manage your tasks in calendar format",
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return <CalendarView />
}
