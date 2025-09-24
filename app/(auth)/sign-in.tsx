import React, { useState, useRef, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    Vibration,
    ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { MockAuthService } from '@/services/mockData'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import tw from 'twrnc'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from "expo-status-bar";

export default function SignInScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isEmailFocused, setIsEmailFocused] = useState(false)
    const [isPasswordFocused, setIsPasswordFocused] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(30)).current
    const buttonScale = useRef(new Animated.Value(1)).current
    const shakeAnim = useRef(new Animated.Value(0)).current

    const { width } = Dimensions.get('window')

    const inputRefs = {
        email: useRef<TextInput>(null),
        password: useRef<TextInput>(null),
    }

    // Validate email format
    const validateEmail = (email: string) => {
        const trimmedEmail = email.trim()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(trimmedEmail)
    }

    useEffect(() => {
        const checkUserSignIn = async () => {
            try {
                // Create development session if none exists (auto-login for development)
                await MockAuthService.createDevelopmentSession()
                
                const token = await AsyncStorage.getItem('token')
                const role = await AsyncStorage.getItem('role')
                if (token && token != null) {
                    if (role == 'farmer') router.replace('/farmer' as any)
                    else if (role == 'veterinary') router.replace('/veterinary' as any)
                    else router.replace('/' as any)
                }
            } catch (error) {
                console.error('Error checking token:', error)
            }
        }
        checkUserSignIn()
        // Animate elements when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start()
    }, [])

    const handleBack = () => {
        Vibration.vibrate(20)
        router.back()
    }

    const handleSignUp = () => {
        Vibration.vibrate(20)
        router.push('/(auth)/sign-up' as any)
    }

    const animateButton = () => {
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            buttonScale.setValue(1) // Reset the value
        })
    }

    const shakeAnimation = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start(() => {
            shakeAnim.setValue(0) // Reset the value
        })
    }

    const handleSignIn = async () => {
        // Reset errors
        setEmailError('')
        setPasswordError('')

        // Validate inputs
        let isValid = true

        if (!email.trim()) {
            setEmailError('Email is required')
            isValid = false
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email')
            isValid = false
        }

        if (!password.trim()) {
            setPasswordError('Password is required')
            isValid = false
        } else if (password.trim().length < 4) {
            setPasswordError('Password must be at least 4 characters')
            isValid = false
        }

        if (!isValid) {
            shakeAnimation()
            Vibration.vibrate([0, 30, 30, 30])
            return
        }

        try {
            Vibration.vibrate(20)
            animateButton()
            setIsLoading(true)

            const { role, token } = await MockAuthService.signIn(email.trim(), password.trim())
            
            // Handle success (save token, navigate)
            await AsyncStorage.setItem('token', token)
            await AsyncStorage.setItem('role', role)
            setIsLoading(false)
            if (role == 'farmer') router.replace('/farmer' as any)
            else if (role == 'veterinary') router.replace('/veterinary' as any)
            else router.replace('/' as any)
        } catch (error) {
            setIsLoading(false)
            const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
            Alert.alert('Login Error', errorMessage)
            console.log('Login error:', error)
            shakeAnimation()
            Vibration.vibrate([0, 30, 30, 30])
            setPassword('')
        }
    }

    const handleForgotPassword = () => {
        Vibration.vibrate(20)
        router.push('/(auth)/forgot-password' as any)
    }

    const handleSocialSignIn = (provider: string) => {
        Vibration.vibrate(20)
        animateButton()
        if (provider === 'Google') router.push('/(auth)/google-sign-in' as any)
    }

    // Enhanced styles
    const styles = {
        container: tw`flex-1 bg-white`,
        scrollContent: tw`flex-grow pb-10`,
        mainContent: [
            tw`flex-1 px-7 pt-4`,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ],
        backButton: tw`w-12 h-12 items-center justify-center rounded-full bg-gray-50 shadow-sm mt-2`,
        headerContainer: tw`mt-10 mb-10`,
        headerTitle: tw`text-3xl font-bold text-orange-600 text-center`,
        headerSubtitle: tw`text-gray-500 mt-2 text-base`,
        formContainer: [tw`space-y-6`, { transform: [{ translateX: shakeAnim }] }],
        inputLabel: tw`text-gray-700 font-medium mb-2 ml-1`,
        inputContainer: (isFocused: boolean, hasError: boolean) => [
            tw`flex-row items-center bg-gray-50 rounded-xl overflow-hidden border`,
            isFocused ? tw`border-orange-300` : tw`border-gray-200`,
            hasError ? tw`border-red-500` : undefined,
            tw`shadow-sm`,
        ],
        iconContainer: tw`pl-4 pr-2`,
        inputField: tw`flex-1 h-14 text-base text-gray-800`,
        errorText: tw`text-orange-600 ml-1 mt-1 text-xs`,
        forgotPasswordContainer: tw`items-end mb-7 mt-1`,
        forgotPasswordText: tw`text-orange-600 font-medium`,
        signInButton: tw`h-14 rounded-xl overflow-hidden shadow-md mb-2`,
        buttonContent: tw`w-full h-full items-center justify-center`,
        buttonText: tw`text-white font-semibold text-lg`,
        loadingContainer: tw`flex-row items-center`,
        loadingText: tw`text-white font-semibold text-lg ml-2`,
        dividerContainer: tw`flex-row items-center my-8`,
        dividerLine: tw`flex-1 h-[1px] bg-gray-200`,
        dividerText: tw`mx-4 text-gray-400 font-medium`,
        socialContainer: tw`flex-row justify-between mb-2`,
        socialButton: (provider: string) => [
            tw`h-14 border border-gray-200 rounded-xl items-center justify-center shadow-sm bg-white`,
            { width: '47%' },
        ],
        socialButtonContent: tw`flex-row items-center`,
        socialButtonText: tw`ml-2 font-medium text-gray-700`,
        signUpContainer: tw`flex-row justify-center mt-auto mb-6 pt-8`,
        signUpText: tw`text-gray-500 text-base`,
        signUpLinkText: tw`text-orange-600 font-semibold text-base`,
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" translucent={false} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View style={styles.mainContent}>
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerTitle}>Welcome Back</Text>
                    </View>

                    {/* Form */}
                    <Animated.View style={styles.formContainer}>
                        {/* Email Input */}
                        <View style={tw`mb-6`}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.inputContainer(isEmailFocused, !!emailError)}>
                                <View style={styles.iconContainer}>
                                    <Ionicons
                                        name="mail-outline"
                                        size={22}
                                        color={emailError ? '#EF4444' : isEmailFocused ? 'orange' : '#9CA3AF'}
                                    />
                                </View>
                                <TextInput
                                    ref={inputRefs.email}
                                    style={styles.inputField}
                                    placeholder="Enter your email"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text)
                                        if (emailError) setEmailError('')
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#9CA3AF"
                                    onFocus={() => setIsEmailFocused(true)}
                                    onBlur={() => setIsEmailFocused(false)}
                                    returnKeyType="next"
                                    onSubmitEditing={() => inputRefs.password.current?.focus()}
                                />
                            </View>
                            {emailError && <Text style={styles.errorText}>{emailError}</Text>}
                        </View>

                        {/* Password Input */}
                        <View style={tw`mb-4`}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputContainer(isPasswordFocused, !!passwordError)}>
                                <View style={styles.iconContainer}>
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={22}
                                        color={passwordError ? '#EF4444' : isPasswordFocused ? 'orange' : '#9CA3AF'}
                                    />
                                </View>
                                <TextInput
                                    ref={inputRefs.password}
                                    style={styles.inputField}
                                    placeholder="Enter your password"
                                    autoCapitalize='none'
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text)
                                        if (passwordError) setPasswordError('')
                                    }}
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor="#9CA3AF"
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSignIn}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={tw`px-4`}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={22}
                                        color={isPasswordFocused ? 'orange' : '#9CA3AF'}
                                    />
                                </TouchableOpacity>
                            </View>
                            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity
                            onPress={handleForgotPassword}
                            style={styles.forgotPasswordContainer}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Sign In Button */}
                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                            <TouchableOpacity
                                onPress={handleSignIn}
                                style={styles.signInButton}
                                activeOpacity={0.9}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={['#FF6500', '#FF4C00']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonContent}
                                >
                                    {isLoading ? (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator size="small" color="white" />
                                            <Text style={styles.loadingText}>Signing In...</Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.buttonText}>Sign In</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* OR Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Sign In - Buttons with improved spacing */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity
                                onPress={() => handleSocialSignIn('Google')}
                                style={styles.socialButton('Google')}
                                activeOpacity={0.8}
                            >
                                <View style={styles.socialButtonContent}>
                                    <FontAwesome name="google" size={20} color="#DB4437" />
                                    <Text style={styles.socialButtonText}>Google</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleSocialSignIn('Apple')}
                                style={styles.socialButton('Apple')}
                                activeOpacity={0.8}
                            >
                                <View style={styles.socialButtonContent}>
                                    <FontAwesome name="apple" size={22} color="#000" />
                                    <Text style={styles.socialButtonText}>Apple</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Development Quick Login Buttons */}
                    <View style={tw`mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200`}>
                        <Text style={tw`text-gray-600 text-sm font-medium mb-3 text-center`}>🚀 Development Quick Login</Text>
                        <View style={tw`flex-row justify-between gap-2`}>
                            <TouchableOpacity
                                onPress={async () => {
                                    await MockAuthService.loginAsFarmer()
                                    router.replace('/farmer' as any)
                                }}
                                style={tw`flex-1 bg-green-100 p-3 rounded-lg border border-green-200`}
                            >
                                <Text style={tw`text-green-700 text-xs font-semibold text-center`}>🚜 Farmer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={async () => {
                                    await MockAuthService.loginAsVeterinary()
                                    router.replace('/veterinary' as any)
                                }}
                                style={tw`flex-1 bg-blue-100 p-3 rounded-lg border border-blue-200`}
                            >
                                <Text style={tw`text-blue-700 text-xs font-semibold text-center`}>🩺 Vet</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={async () => {
                                    await MockAuthService.loginAsAdmin()
                                    router.replace('/' as any)
                                }}
                                style={tw`flex-1 bg-purple-100 p-3 rounded-lg border border-purple-200`}
                            >
                                <Text style={tw`text-purple-700 text-xs font-semibold text-center`}>👑 Admin</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.signUpContainer}>
                        <Text style={styles.signUpText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
                            <Text style={styles.signUpLinkText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    )
}
