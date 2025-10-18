/**
 * ContactUsScreen
 * Contact form with validation and Supabase feedback submission
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useTheme} from '@theme/useTheme';
import {colors, spacing, typography, borderRadius, shadows} from '@theme/tokens';
import {supabase} from '@lib/supabase';
import type {RootStackParamList} from '../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface FormData {
  name: string;
  surname: string;
  email: string;
  feedback: string;
}

interface FormErrors {
  name?: string;
  surname?: string;
  email?: string;
  feedback?: string;
}

export default function ContactUsScreen() {
  const {t} = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const {colors: themedColors} = useTheme();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    surname: '',
    email: '',
    feedback: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themedColors.background,
    },
    header: {
      backgroundColor: themedColors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: themedColors.border,
    },
    headerTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      color: themedColors.text,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: typography.sizes.base,
      color: themedColors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    form: {
      backgroundColor: themedColors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      ...shadows.sm,
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.medium,
      color: themedColors.text,
      marginBottom: spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: themedColors.border,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: typography.sizes.base,
      color: themedColors.text,
      backgroundColor: themedColors.background,
    },
    inputError: {
      borderColor: colors.red[500],
    },
    textArea: {
      height: 120,
      textAlignVertical: 'top',
    },
    errorText: {
      fontSize: typography.sizes.sm,
      color: colors.red[500],
      marginTop: spacing.xs,
    },
    submitButton: {
      backgroundColor: colors.primary[600],
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    submitButtonDisabled: {
      backgroundColor: colors.gray[400],
    },
    submitButtonText: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold,
      color: '#ffffff',
    },
    backButton: {
      position: 'absolute',
      top: spacing.lg,
      left: spacing.lg,
      zIndex: 1,
    },
    backButtonText: {
      fontSize: typography.sizes.lg,
      color: themedColors.text,
    },
    // Success Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: themedColors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      margin: spacing.lg,
      alignItems: 'center',
      ...shadows.lg,
    },
    modalIcon: {
      fontSize: 48,
      marginBottom: spacing.lg,
    },
    modalTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.bold,
      color: themedColors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    modalMessage: {
      fontSize: typography.sizes.base,
      color: themedColors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    modalButton: {
      backgroundColor: colors.primary[600],
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
    },
    modalButtonText: {
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.semibold,
      color: '#ffffff',
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('contactUs.validation.nameRequired');
    }

    if (!formData.surname.trim()) {
      newErrors.surname = t('contactUs.validation.surnameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contactUs.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contactUs.validation.emailInvalid');
    }

    if (!formData.feedback.trim()) {
      newErrors.feedback = t('contactUs.validation.feedbackRequired');
    } else if (formData.feedback.trim().length < 10) {
      newErrors.feedback = t('contactUs.validation.feedbackMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const {error} = await supabase.from('feedback').insert({
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        email: formData.email.trim(),
        message: formData.feedback.trim(),
      });

      if (error) {
        console.error('Feedback submission error:', error);
        Alert.alert(
          t('contactUs.errorTitle'),
          t('contactUs.errorMessage'),
        );
        return;
      }

      // Show success modal
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        name: '',
        surname: '',
        email: '',
        feedback: '',
      });
      setErrors({});

      // Auto-dismiss modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);

    } catch (error) {
      console.error('Feedback submission exception:', error);
      Alert.alert(
        t('contactUs.errorTitle'),
        t('contactUs.errorMessage'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          style={dynamicStyles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={dynamicStyles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>{t('contactUs.title')}</Text>
        <Text style={dynamicStyles.headerSubtitle}>{t('contactUs.subtitle')}</Text>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        <View style={dynamicStyles.form}>
          {/* Name Input */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>{t('contactUs.name')}</Text>
            <TextInput
              style={[
                dynamicStyles.input,
                errors.name ? dynamicStyles.inputError : null,
              ]}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder={t('contactUs.name')}
              placeholderTextColor={themedColors.textSecondary}
            />
            {errors.name && <Text style={dynamicStyles.errorText}>{errors.name}</Text>}
          </View>

          {/* Surname Input */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>{t('contactUs.surname')}</Text>
            <TextInput
              style={[
                dynamicStyles.input,
                errors.surname ? dynamicStyles.inputError : null,
              ]}
              value={formData.surname}
              onChangeText={(value) => updateFormData('surname', value)}
              placeholder={t('contactUs.surname')}
              placeholderTextColor={themedColors.textSecondary}
            />
            {errors.surname && <Text style={dynamicStyles.errorText}>{errors.surname}</Text>}
          </View>

          {/* Email Input */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>{t('contactUs.email')}</Text>
            <TextInput
              style={[
                dynamicStyles.input,
                errors.email ? dynamicStyles.inputError : null,
              ]}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder={t('contactUs.email')}
              placeholderTextColor={themedColors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={dynamicStyles.errorText}>{errors.email}</Text>}
          </View>

          {/* Feedback Input */}
          <View style={dynamicStyles.inputGroup}>
            <Text style={dynamicStyles.label}>{t('contactUs.feedback')}</Text>
            <TextInput
              style={[
                dynamicStyles.input,
                dynamicStyles.textArea,
                errors.feedback ? dynamicStyles.inputError : null,
              ]}
              value={formData.feedback}
              onChangeText={(value) => updateFormData('feedback', value)}
              placeholder={t('contactUs.feedbackPlaceholder')}
              placeholderTextColor={themedColors.textSecondary}
              multiline
              numberOfLines={5}
            />
            {errors.feedback && <Text style={dynamicStyles.errorText}>{errors.feedback}</Text>}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              dynamicStyles.submitButton,
              isSubmitting && dynamicStyles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={dynamicStyles.submitButtonText}>
                {t('contactUs.sendFeedback')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}>
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalIcon}>✅</Text>
            <Text style={dynamicStyles.modalTitle}>{t('contactUs.successTitle')}</Text>
            <Text style={dynamicStyles.modalMessage}>{t('contactUs.successMessage')}</Text>
            <TouchableOpacity
              style={dynamicStyles.modalButton}
              onPress={() => setShowSuccessModal(false)}>
              <Text style={dynamicStyles.modalButtonText}>{t('common.ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
