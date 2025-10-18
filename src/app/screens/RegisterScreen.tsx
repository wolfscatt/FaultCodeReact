/**
 * Register Screen
 * New user registration with email and password
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useUserStore} from '@state/useUserStore';
import type {RootStackParamList} from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {register, isLoading} = useUserStore();
  const {colors: themedColors} = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const result = await register(email, password);

    if (result.success) {
      // Check if email verification is required
      if (result.requiresVerification) {
        Alert.alert(
          '✅ Registration Successful',
          'We\'ve sent a verification link to your email. Please check your inbox and verify your account before logging in.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
      } else {
        // Auto-confirmed (email verification disabled)
        Alert.alert(
          'Success',
          'Account created successfully!',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.reset({
                  index: 0,
                  routes: [{name: 'MainTabs'}],
                }),
            },
          ],
        );
      }
    } else {
      Alert.alert('Registration Failed', result.error || 'Please try again');
    }
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  // Create dynamic styles based on current theme - Modern design
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 48,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: '#000000',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: '#6B7280',
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputContainerLarge: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: '#000000',
      marginBottom: 8,
    },
    input: {
      backgroundColor: '#ffffff',
      color: '#000000',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      fontSize: 16,
    },
    hint: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 4,
    },
    button: {
      backgroundColor: '#3366FF',
      paddingVertical: 16,
      borderRadius: 10,
      marginBottom: 24,
      opacity: isLoading ? 0.7 : 1,
    },
    buttonText: {
      color: '#ffffff',
      textAlign: 'center',
      fontWeight: '600',
      fontSize: 16,
    },
    linkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 32,
    },
    linkText: {
      color: '#6B7280',
      fontSize: 14,
    },
    linkButton: {
      color: '#3366FF',
      fontWeight: '600',
      fontSize: 14,
    },
    termsContainer: {
      marginTop: 32,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    termsText: {
      textAlign: 'center',
      fontSize: 12,
      color: '#6B7280',
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Başlamak için kayıt olun</Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            placeholder="eposta@ornek.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isLoading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            editable={!isLoading}
          />
          <Text style={styles.hint}>En az 6 karakter</Text>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainerLarge}>
          <Text style={styles.label}>Şifre Tekrarı</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            editable={!isLoading}
          />
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Hesap Oluştur</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Zaten hesabınız var mı? </Text>
          <TouchableOpacity onPress={goToLogin} disabled={isLoading}>
            <Text style={styles.linkButton}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>

        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Hesap oluşturarak Kullanım Şartları ve{'\n'}
            Gizlilik Politikasını kabul etmiş olursunuz
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

