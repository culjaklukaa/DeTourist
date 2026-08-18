import { Redirect } from 'expo-router';

export default function Index() {
  // The _layout.tsx file handles the actual authentication checks and routing.
  // This file simply provides a valid entry point for the '/' route 
  // to prevent the "Unmatched Route" error on the web.
  return <Redirect href="/(auth)/sign-in" />;
}
