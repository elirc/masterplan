import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LoginPage() {
  const currentUser = await requireUser();
  if (currentUser) {
    redirect("/today");
  }

  const userCount = await prisma.user.count();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Master Life Plan</h1>
        <p className="mt-1 text-sm text-slate-600">
          {userCount === 0 ? "Create your first account" : "Sign in to continue"}
        </p>
        <LoginForm hasUsers={userCount > 0} />
      </div>
    </main>
  );
}



