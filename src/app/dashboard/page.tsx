import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "./DashboardView";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#FAFAF7] px-6 py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/30 blur-3xl" />
        <div className="absolute left-[60%] top-[60%] h-[300px] w-[300px] rounded-full bg-indigo-300/25 blur-3xl" />
      </div>
      <DashboardView email={user.email} />
    </div>
  );
}
