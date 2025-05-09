import { Stack } from "expo-router";
import { StudentInfoProvider } from "../context/StudentInfoContext";

export default function Layout() {
  return (
    <StudentInfoProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </StudentInfoProvider>
  );
}
