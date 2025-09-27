import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Animated,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import { router } from 'expo-router';

// New context imports
import { useAuth } from '@/contexts/AuthContext';
import { useSchedules } from '@/contexts/ScheduleContext';
import { useScheduleActions } from '@/hooks/useScheduleActions';
import { ScheduleStatus } from '@/types/schedule';

export default function ScheduleDetailScreen() {
    const { currentUser } = useAuth();
    const { currentSchedule, isLoading } = useSchedules();
    const { updateSchedule } = useScheduleActions();
    
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleStatusUpdate = async (status: ScheduleStatus) => {
        if (!currentSchedule) return;
        
        try {
            await updateSchedule({
                ...currentSchedule,
                status
            });
            Alert.alert('Success', `Schedule ${status.toLowerCase()} successfully!`);
        } catch (error) {
            console.error('Error updating schedule:', error);
            Alert.alert('Error', 'Failed to update schedule');
        }
    };

    if (isLoading || !currentSchedule || !currentUser) {
        return (
            <SafeAreaView style={tw`flex-1 bg-gray-50 justify-center items-center`}>
                <Text style={tw`text-gray-600 text-lg`}>Loading schedule details...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-50`}>
            <Animated.View style={[tw`flex-1`, { opacity: fadeAnim }]}>
                {/* Header */}
                <View style={tw`px-4 pt-2 pb-4`}>
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB']}
                        style={tw`rounded-3xl p-6 shadow-xl`}
                    >
                        <View style={tw`flex-row items-center justify-between`}>
                            <TouchableOpacity
                                style={tw`bg-white bg-opacity-20 p-3 rounded-2xl`}
                                onPress={() => router.back()}
                            >
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                            <View style={tw`flex-1 ml-4`}>
                                <Text style={tw`text-white font-medium`}>Schedule Details</Text>
                                <Text style={tw`text-white text-2xl font-bold`}>{currentSchedule.title}</Text>
                                <Text style={tw`text-blue-100 text-sm`}>
                                    {currentSchedule.type}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                <ScrollView style={tw`flex-1 px-4`} showsVerticalScrollIndicator={false}>
                    {/* Schedule Info */}
                    <View style={tw`bg-white rounded-2xl p-6 mb-6 shadow-md`}>
                        <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>
                            Appointment Information
                        </Text>
                        
                        <View style={tw`space-y-4`}>
                            <View>
                                <Text style={tw`text-gray-500 text-sm font-medium`}>Date & Time</Text>
                                <Text style={tw`text-gray-800 text-lg font-semibold`}>
                                    {new Date(currentSchedule.scheduledDate).toLocaleDateString()}
                                </Text>
                                <Text style={tw`text-gray-600`}>
                                    {currentSchedule.scheduledTime || 'Time to be determined'}
                                </Text>
                            </View>

                            <View>
                                <Text style={tw`text-gray-500 text-sm font-medium`}>Status</Text>
                                <View style={tw`flex-row items-center mt-1`}>
                                    <View style={tw`w-3 h-3 rounded-full ${
                                        currentSchedule.status === ScheduleStatus.CONFIRMED ? 'bg-green-500' :
                                        currentSchedule.status === ScheduleStatus.PENDING ? 'bg-yellow-500' :
                                        currentSchedule.status === ScheduleStatus.CANCELLED ? 'bg-red-500' :
                                        'bg-gray-500'
                                    } mr-2`} />
                                    <Text style={tw`text-gray-800 font-medium`}>
                                        {currentSchedule.status}
                                    </Text>
                                </View>
                            </View>

                            <View>
                                <Text style={tw`text-gray-500 text-sm font-medium`}>Priority</Text>
                                <Text style={tw`text-gray-800 font-medium`}>
                                    {currentSchedule.priority}
                                </Text>
                            </View>

                            <View>
                                <Text style={tw`text-gray-500 text-sm font-medium`}>Description</Text>
                                <Text style={tw`text-gray-800 mt-1 leading-6`}>
                                    {currentSchedule.description}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Actions */}
                    {currentUser.role === 'VETERINARY' && currentSchedule.status === ScheduleStatus.PENDING && (
                        <View style={tw`bg-white rounded-2xl p-6 mb-6 shadow-md`}>
                            <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>
                                Actions
                            </Text>
                            
                            <View style={tw`flex-row gap-3`}>
                                <TouchableOpacity
                                    style={tw`flex-1 bg-green-500 py-4 px-6 rounded-xl`}
                                    onPress={() => handleStatusUpdate(ScheduleStatus.CONFIRMED)}
                                >
                                    <Text style={tw`text-white font-bold text-center text-lg`}>
                                        Approve
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={tw`flex-1 bg-red-500 py-4 px-6 rounded-xl`}
                                    onPress={() => handleStatusUpdate(ScheduleStatus.CANCELLED)}
                                >
                                    <Text style={tw`text-white font-bold text-center text-lg`}>
                                        Reject
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Additional Info */}
                    <View style={tw`bg-white rounded-2xl p-6 shadow-md`}>
                        <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>
                            Additional Information
                        </Text>
                        
                        <View style={tw`space-y-3`}>
                            <View style={tw`flex-row items-center`}>
                                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                                <Text style={tw`text-gray-600 ml-3`}>
                                    Created: {new Date(currentSchedule.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            
                            <View style={tw`flex-row items-center`}>
                                <Ionicons name="time-outline" size={20} color="#6B7280" />
                                <Text style={tw`text-gray-600 ml-3`}>
                                    Last updated: {new Date(currentSchedule.updatedAt).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}
