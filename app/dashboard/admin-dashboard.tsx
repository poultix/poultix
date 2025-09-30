import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import tw from 'twrnc';

import CustomDrawer from '@/components/CustomDrawer';
import DrawerButton from '@/components/DrawerButton';
import { useDrawer } from '@/contexts/DrawerContext';

// Context imports
import { useAuth } from '@/contexts/AuthContext';
import AdminOverview from '@/components/dashboard/admin/overview';
import AdminDataList from '@/components/dashboard/admin/dataList';

export default function AdminDashboardScreen() {
  const { isDrawerVisible, setIsDrawerVisible } = useDrawer();
  const { currentUser } = useAuth();

  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'farms' | 'schedules'>('overview');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      Alert.alert('Access Denied', 'Admin privileges required', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-50 justify-center items-center`}>
        <Ionicons name="lock-closed-outline" size={64} color="#6B7280" />
        <Text style={tw`text-gray-600 text-lg mt-4`}>Access Denied</Text>
      </SafeAreaView>
    );
  }

 

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>

      <Animated.View style={[tw`flex-1`, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={tw` pb-4`}>
          <LinearGradient
            colors={['#7C3AED', '#6D28D9']}
            style={tw`r p-8 shadow-xl`}
          >
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <View style={tw`flex-1`}>
                <Text style={tw`text-white text-sm opacity-90`}>
                  Admin Dashboard
                </Text>
                <Text style={tw`text-white text-2xl font-bold`}>
                  Welcome, {currentUser?.name} 👑
                </Text>
                <Text style={tw`text-purple-100 text-sm mt-1`}>
                  System Administrator
                </Text>
              </View>
              <DrawerButton />
            </View>
          </LinearGradient>
        </View>

        {/* Navigation Tabs */}
        <View style={tw`px-4 mb-4`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row gap-2`}>
              {[
                { key: 'overview', label: 'Overview', icon: 'analytics-outline' },
                { key: 'users', label: 'Users', icon: 'people-outline' },
                { key: 'farms', label: 'Farms', icon: 'leaf-outline' },
                { key: 'schedules', label: 'Schedules', icon: 'calendar-outline' },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    tw`px-4 py-3 rounded-xl flex-row items-center`,
                    selectedTab === tab.key ? tw`bg-purple-500` : tw`bg-white`
                  ]}
                  onPress={() => setSelectedTab(tab.key as any)}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={16}
                    color={selectedTab === tab.key ? 'white' : '#6B7280'}
                  />
                  <Text style={[
                    tw`ml-2 font-medium`,
                    selectedTab === tab.key ? tw`text-white` : tw`text-gray-600`
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
          {selectedTab === 'overview' ? <AdminOverview /> : <AdminDataList/>}
        </ScrollView>
      </Animated.View>

      <CustomDrawer
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
    </SafeAreaView>
  );
}
