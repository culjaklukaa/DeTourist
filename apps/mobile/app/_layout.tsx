import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useStore } from '../src/store';
import { initDB } from '../src/lib/storage';

export default function RootLayout() {
  const { isAuthenticated, isLoading, restoreSession } = useStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initDB().catch(console.error);
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // If not logged in and not in the auth group, redirect to sign-in
      router.replace('/(auth)/sign-in');
    } else if (isAuthenticated && inAuthGroup) {
      // If logged in and in the auth group, redirect to tabs
      router.replace('/(tabs)/discover');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    // Optionally return a splash screen here
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
