import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Typography, Input, Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { useStore } from '@/store';
import { api } from '@/lib/api';
import { DEMO_MODE, MOCK_TOKENS } from '@/lib/mockData';
import { Compass } from 'lucide-react-native';

export default function SignInScreen() {
  const router = useRouter();
  const { colors, spacing, layout } = useTheme();
  const signIn = useStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (DEMO_MODE) {
        // Simulate a short delay for realism
        await new Promise((r) => setTimeout(r, 500));
        await signIn(MOCK_TOKENS.access_token, MOCK_TOKENS.refresh_token);
        return;
      }

      // Backend uses OAuth2PasswordRequestForm (form-encoded)
      const formData = new URLSearchParams();
      formData.append('username', email.trim());
      formData.append('password', password);

      const { data } = await api.post('/v1/auth/login', formData.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      await signIn(data.access_token, data.refresh_token);
      // Routing is handled by the auth guard in _layout.tsx
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || err.message || 'Sign in failed';
      setError(typeof msg === 'string' ? msg : 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.surface.base }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Branded header */}
        <View style={[styles.header, { paddingTop: layout.screenPaddingTop + spacing[10] }]}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: colors.primary.default },
            ]}
          >
            <Compass size={40} color={colors.text.inverse} />
          </View>
          <Typography variant="displayLg" color="primary" style={{ marginTop: spacing[4] }}>
            DeTourist
          </Typography>
          <Typography variant="bodyLg" color="secondary" style={{ marginTop: spacing[1] }}>
            Explore smarter, not harder.
          </Typography>
        </View>

        {/* Form */}
        <View style={{ gap: spacing[4], paddingHorizontal: layout.screenPaddingX, marginTop: spacing[10] }}>
          <Typography variant="headingLg" color="primary">
            Welcome back
          </Typography>

          {error && (
            <View style={[styles.errorBanner, { backgroundColor: colors.error.bg }]}>
              <Typography variant="bodySm" color="error">
                {error}
              </Typography>
            </View>
          )}

          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            label="Sign In"
            onPress={handleSignIn}
            loading={isLoading}
            style={{ marginTop: spacing[2] }}
          />

          <Button
            label="Don't have an account? Sign up"
            variant="ghost"
            onPress={() => router.push('/(auth)/sign-up')}
          />

          {DEMO_MODE && (
            <Typography
              variant="caption"
              color="tertiary"
              style={{ textAlign: 'center', marginTop: spacing[2] }}
            >
              Demo mode — any credentials will work
            </Typography>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  header: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
  },
});
