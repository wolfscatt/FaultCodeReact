/**
 * Login Screen
 * User authentication with email and password
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

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {login, isLoading} = useUserStore();
  const {colors: themedColors} = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      // Navigate to main app
      navigation.navigate('MainTabs');
    } else {
      Alert.alert('Login Failed', result.error || 'Please try again');
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
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
    guestContainer: {
      marginTop: 32,
      paddingTop: 24,
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
    },
    guestButton: {
      paddingVertical: 16,
    },
    guestText: {
      textAlign: 'center',
      color: '#6B7280',
      fontSize: 14,
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
          <Text style={styles.title}>FaultCode&apos;a Hoş Geldiniz</Text>
          <Text style={styles.subtitle}>Global kombi arıza kodları asistanınız</Text>
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
        <View style={styles.inputContainerLarge}>
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
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Hesabınız yok mu? </Text>
          <TouchableOpacity onPress={goToRegister} disabled={isLoading}>
            <Text style={styles.linkButton}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Option */}
        <View style={styles.guestContainer}>
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => navigation.navigate('MainTabs')}
            disabled={isLoading}>
            <Text style={styles.guestText}>
              Misafir Olarak Devam Et (Sınırlı Özellikler)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

