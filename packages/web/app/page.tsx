import { redirect } from "next/navigation"
import { jwtDecode } from 'jwt-decode'
import getSession from "@/utils/supabase/getSession"


export default async function Page() {
  // Get the current session
  const session = await getSession()
  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login")
  }

  // Decode the JWT to extract the user role
  const jwt: any = jwtDecode(session.access_token)

  console.log("JWT:", session.access_token)
  console.log("Decoded JWT:", jwt)
  const userRole = jwt.user_role

  if (userRole === "developer") {

    redirect("/bounties")

  }

  // Non-developer users are redirected to dashboard
  redirect("/dashboard")
}
