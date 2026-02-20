import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ClientProviders from "@/components/ClientProviders";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  return (
    <ClientProviders>
      <div className="flex min-h-screen">
        <Navbar />
        <main className="flex-1 md:ml-56 pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </ClientProviders>
  );
}
