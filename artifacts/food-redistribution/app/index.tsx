import { useApp } from "@/context/AppContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { isAuthenticated, activeRole } = useApp();

  if (!isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  if (activeRole === "ngo") return <Redirect href="/(ngo)" />;
  if (activeRole === "admin") return <Redirect href="/(admin)" />;
  if (activeRole === "sponsor") return <Redirect href="/(sponsor)" />;

  return <Redirect href="/(donor)" />;
}
