import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import { router } from 'expo-router';
import CustomDrawer from '@/components/CustomDrawer';
import { useDrawer } from '@/contexts/DrawerContext';
import DrawerButton from '@/components/DrawerButton';
import { useRoleBasedData, useUsers, useFarms, useSchedules, useVeterinaries } from '@/hooks/useCrud';
import { User, Farm, Schedule } from '@/types/entities';

export default function AdminDashboardScreen() {
  const { isDrawerVisible, setIsDrawerVisible } = useDrawer();
  const { currentUser, isAdmin } = useRoleBasedData();
  const { users, getUsersByRole, searchUsers, filterUsers } = useUsers();
  const { farms, searchFarms, filterFarms } = useFarms();
  const { schedules, searchSchedules, filterSchedules } = useSchedules();
  const { veterinaries } = useVeterinaries();
  
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'farms' | 'schedules' | 'veterinaries'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isAdmin) {
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
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-50 justify-center items-center`}>
        <Ionicons name="lock-closed-outline" size={64} color="#6B7280" />
        <Text style={tw`text-gray-600 text-lg mt-4`}>Access Denied</Text>
      </SafeAreaView>
    );
  }

  const getFilteredData = () => {
    let filteredData: any[] = [];
    
    switch (selectedTab) {
      case 'users':
        filteredData = searchQuery 
          ? searchUsers(searchQuery)
          : selectedFilter === 'all' 
            ? users 
            : getUsersByRole(selectedFilter as User['role']);
        break;
      
      case 'farms':
        filteredData = searchQuery 
          ? searchFarms(searchQuery)
          : selectedFilter === 'all'
            ? farms
            : filterFarms({ healthStatus: selectedFilter as Farm['healthStatus'] });
        break;
      
      case 'schedules':
        filteredData = searchQuery 
          ? searchSchedules(searchQuery)
          : selectedFilter === 'all'
            ? schedules
            : filterSchedules({ scheduleStatus: selectedFilter as Schedule['status'] });
        break;
      
      case 'veterinaries':
        filteredData = veterinaries;
        break;
      
      default:
        filteredData = [];
    }
    
    return filteredData;
  };

  const getFilterOptions = () => {
    switch (selectedTab) {
      case 'users':
        return [
          { key: 'all', label: 'All Users' },
          { key: 'farmer', label: 'Farmers' },
          { key: 'veterinary', label: 'Veterinaries' },
          { key: 'admin', label: 'Admins' },
        ];
      
      case 'farms':
        return [
          { key: 'all', label: 'All Farms' },
          { key: 'excellent', label: 'Excellent' },
          { key: 'good', label: 'Good' },
          { key: 'fair', label: 'Fair' },
          { key: 'poor', label: 'Poor' },
        ];
      
      case 'schedules':
        return [
          { key: 'all', label: 'All Schedules' },
          { key: 'scheduled', label: 'Scheduled' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' },
        ];
      
      default:
        return [{ key: 'all', label: 'All' }];
    }
  };

  const renderOverview = () => (
    <View style={tw`px-4`}>
      {/* Statistics Cards */}
      <View style={tw`flex-row flex-wrap gap-3 mb-6`}>
        <View style={tw`flex-1 bg-white rounded-2xl p-4 shadow-sm min-w-[45%]`}>
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <Ionicons name="people-outline" size={24} color="#3B82F6" />
            <Text style={tw`text-2xl font-bold text-gray-800`}>{users.length}</Text>
          </View>
          <Text style={tw`text-gray-600 font-medium`}>Total Users</Text>
          <Text style={tw`text-xs text-gray-500 mt-1`}>
            {getUsersByRole('farmer').length} Farmers, {getUsersByRole('veterinary').length} Vets
          </Text>
        </View>
        
        <View style={tw`flex-1 bg-white rounded-2xl p-4 shadow-sm min-w-[45%]`}>
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <Ionicons name="leaf-outline" size={24} color="#10B981" />
            <Text style={tw`text-2xl font-bold text-gray-800`}>{farms.length}</Text>
          </View>
          <Text style={tw`text-gray-600 font-medium`}>Active Farms</Text>
          <Text style={tw`text-xs text-gray-500 mt-1`}>
            {farms.reduce((sum, farm) => sum + farm.livestock.chickens.total, 0).toLocaleString()} Total Chickens
          </Text>
        </View>
        
        <View style={tw`flex-1 bg-white rounded-2xl p-4 shadow-sm min-w-[45%]`}>
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <Ionicons name="calendar-outline" size={24} color="#F59E0B" />
            <Text style={tw`text-2xl font-bold text-gray-800`}>{schedules.length}</Text>
          </View>
          <Text style={tw`text-gray-600 font-medium`}>Schedules</Text>
          <Text style={tw`text-xs text-gray-500 mt-1`}>
            {schedules.filter(s => s.status === 'scheduled').length} Pending
          </Text>
        </View>
        
        <View style={tw`flex-1 bg-white rounded-2xl p-4 shadow-sm min-w-[45%]`}>
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <Ionicons name="medical-outline" size={24} color="#EF4444" />
            <Text style={tw`text-2xl font-bold text-gray-800`}>{veterinaries.length}</Text>
          </View>
          <Text style={tw`text-gray-600 font-medium`}>Veterinaries</Text>
          <Text style={tw`text-xs text-gray-500 mt-1`}>
            {veterinaries.filter(v => v.isActive).length} Active
          </Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={tw`bg-white rounded-2xl p-5 shadow-sm mb-4`}>
        <Text style={tw`text-lg font-bold text-gray-800 mb-4`}>Recent Activity</Text>
        {schedules.slice(0, 5).map((schedule) => {
          const farm = farms.find(f => f.id === schedule.farmId);
          const farmer = users.find(u => u.id === schedule.farmerId);
          
          return (
            <View key={schedule.id} style={tw`flex-row items-center py-3 border-b border-gray-100 last:border-b-0`}>
              <View style={tw`w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3`}>
                <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`font-medium text-gray-800`}>{schedule.title}</Text>
                <Text style={tw`text-sm text-gray-600`}>
                  {farm?.name} • {farmer?.name}
                </Text>
                <Text style={tw`text-xs text-gray-500`}>
                  {schedule.scheduledDate.toLocaleDateString()}
                </Text>
              </View>
              <View style={[
                tw`px-2 py-1 rounded-full`,
                schedule.status === 'completed' ? tw`bg-green-100` :
                schedule.status === 'scheduled' ? tw`bg-blue-100` : tw`bg-gray-100`
              ]}>
                <Text style={[
                  tw`text-xs font-medium capitalize`,
                  schedule.status === 'completed' ? tw`text-green-600` :
                  schedule.status === 'scheduled' ? tw`text-blue-600` : tw`text-gray-600`
                ]}>
                  {schedule.status}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderDataList = () => {
    const data = getFilteredData();
    
    return (
      <View style={tw`px-4`}>
        {/* Search and Filter */}
        <View style={tw`bg-white rounded-2xl p-4 mb-4 shadow-sm`}>
          <View style={tw`flex-row items-center mb-3`}>
            <View style={tw`flex-1 bg-gray-100 rounded-xl px-4 py-3 mr-3`}>
              <TextInput
                style={tw`text-gray-800`}
                placeholder={`Search ${selectedTab}...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={tw`bg-blue-500 p-3 rounded-xl`}>
              <Ionicons name="search-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row gap-2`}>
              {getFilterOptions().map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    tw`px-4 py-2 rounded-full border`,
                    selectedFilter === option.key
                      ? tw`bg-blue-500 border-blue-500`
                      : tw`bg-white border-gray-200`
                  ]}
                  onPress={() => setSelectedFilter(option.key)}
                >
                  <Text style={[
                    tw`font-medium`,
                    selectedFilter === option.key ? tw`text-white` : tw`text-gray-600`
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Data List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {data.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={tw`bg-white rounded-2xl p-4 mb-3 shadow-sm`}
              onPress={() => {
                // Navigate to detail screen based on type
                if (selectedTab === 'users') {
                  router.push(`/user-detail/${item.id}` as any);
                } else if (selectedTab === 'farms') {
                  router.push(`/farm-detail/${item.id}` as any);
                } else if (selectedTab === 'schedules') {
                  router.push(`/schedule-detail/${item.id}` as any);
                }
              }}
            >
              {selectedTab === 'users' && (
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw`font-bold text-gray-800`}>{item.name}</Text>
                    <Text style={tw`text-gray-600`}>{item.email}</Text>
                    <Text style={tw`text-sm text-gray-500`}>{item.location}</Text>
                  </View>
                  <View style={[
                    tw`px-3 py-1 rounded-full`,
                    item.role === 'admin' ? tw`bg-purple-100` :
                    item.role === 'farmer' ? tw`bg-green-100` : tw`bg-blue-100`
                  ]}>
                    <Text style={[
                      tw`text-xs font-bold capitalize`,
                      item.role === 'admin' ? tw`text-purple-600` :
                      item.role === 'farmer' ? tw`text-green-600` : tw`text-blue-600`
                    ]}>
                      {item.role}
                    </Text>
                  </View>
                </View>
              )}
              
              {selectedTab === 'farms' && (
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw`font-bold text-gray-800`}>{item.name}</Text>
                    <Text style={tw`text-gray-600`}>{item.location.address}</Text>
                    <Text style={tw`text-sm text-gray-500`}>
                      {item.livestock.chickens.total} chickens • {item.size} hectares
                    </Text>
                  </View>
                  <View style={[
                    tw`px-3 py-1 rounded-full`,
                    item.healthStatus === 'excellent' ? tw`bg-green-100` :
                    item.healthStatus === 'good' ? tw`bg-blue-100` :
                    item.healthStatus === 'fair' ? tw`bg-yellow-100` : tw`bg-red-100`
                  ]}>
                    <Text style={[
                      tw`text-xs font-bold capitalize`,
                      item.healthStatus === 'excellent' ? tw`text-green-600` :
                      item.healthStatus === 'good' ? tw`text-blue-600` :
                      item.healthStatus === 'fair' ? tw`text-yellow-600` : tw`text-red-600`
                    ]}>
                      {item.healthStatus}
                    </Text>
                  </View>
                </View>
              )}
              
              {selectedTab === 'schedules' && (
                <View style={tw`flex-row items-center justify-between`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw`font-bold text-gray-800`}>{item.title}</Text>
                    <Text style={tw`text-gray-600`}>{item.description}</Text>
                    <Text style={tw`text-sm text-gray-500`}>
                      {item.scheduledDate.toLocaleDateString()} • {item.startTime}-{item.endTime}
                    </Text>
                  </View>
                  <View style={[
                    tw`px-3 py-1 rounded-full`,
                    item.status === 'completed' ? tw`bg-green-100` :
                    item.status === 'scheduled' ? tw`bg-blue-100` : tw`bg-gray-100`
                  ]}>
                    <Text style={[
                      tw`text-xs font-bold capitalize`,
                      item.status === 'completed' ? tw`text-green-600` :
                      item.status === 'scheduled' ? tw`text-blue-600` : tw`text-gray-600`
                    ]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      
      <Animated.View style={[tw`flex-1`, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={tw`px-4 pt-2 pb-4`}>
          <LinearGradient
            colors={['#7C3AED', '#6D28D9']}
            style={tw`rounded-3xl p-8 shadow-xl`}
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
                { key: 'veterinaries', label: 'Veterinaries', icon: 'medical-outline' },
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
          {selectedTab === 'overview' ? renderOverview() : renderDataList()}
        </ScrollView>
      </Animated.View>

      <CustomDrawer
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />
    </SafeAreaView>
  );
}
