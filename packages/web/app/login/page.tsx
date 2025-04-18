import { LoginForm } from "@/components/login-form"
import { redirect } from "next/navigation"
import getSession from "@/utils/supabase/getSession"

export default async function Page() {
  if (await getSession()) redirect("/dashboard")

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
