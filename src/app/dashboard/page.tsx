import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { getMockResults } from "@/data/mock-results";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAnonymous = !user?.email;
  const emailPrefix = user?.email?.split("@")[0];
  const displayName = emailPrefix
    ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
    : "Friend";
  const identitySubtitle = isAnonymous ? "Guest profile" : "Class of 2025";

  const data = getMockResults();

  return (
    <DashboardLayout
      isAnonymous={isAnonymous}
      displayName={displayName}
      identitySubtitle={identitySubtitle}
      data={data}
    />
  );
}
