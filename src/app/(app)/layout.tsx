import { requireUser } from "@/lib/auth/require-user";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Tu estructura de Layout utilizando user?.email o user?.full_name */}
      {children}
    </div>
  );
}
