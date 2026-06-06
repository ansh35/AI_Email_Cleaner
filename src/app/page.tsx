import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginScreen } from "@/components/auth/LoginScreen";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return <LoginScreen />;
}
