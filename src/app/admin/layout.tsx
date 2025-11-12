import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

/**
 * Layout pour toutes les routes admin
 * Vérifie l'authentification et le rôle admin côté serveur
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Rediriger vers la page de connexion si non authentifié
  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/admin/dashboard");
  }

  // Vérifier le rôle admin dans la base de données
  await connectDB();
  const user = await User.findOne({ email: session.user.email });

  // Rediriger vers la page d'accueil si pas admin
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
