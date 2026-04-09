import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { onAuthStateChanged, User } from 'firebase/auth';

import HomeScreen from '../screens/home/HomeScreen';
import MissionsScreen from '../screens/missions/MissionsScreen';
import MissionDetailsScreen, {
  MissionsStackParamList,
} from '../screens/missions/MissionDetailsScreen';
import LifeScreen from '../screens/life/LifeScreen';
import AdvisorScreen from '../screens/advisor/AdvisorScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import { auth } from '../services/firebase';

export type RootTabParamList = {
  Life: undefined;
  MissionsTab: NavigatorScreenParams<MissionsStackParamList> | undefined;
  Home: undefined;
  Advisor: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const MissionsStack = createNativeStackNavigator<MissionsStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function MissionsNavigator() {
  return (
    <MissionsStack.Navigator screenOptions={{ headerShown: false }}>
      <MissionsStack.Screen name="MissionsList" component={MissionsScreen} />
      <MissionsStack.Screen
        name="MissionDetails"
        component={MissionDetailsScreen}
      />
    </MissionsStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0C6B61',
        tabBarInactiveTintColor: '#0C6B61',
        tabBarStyle: {
          backgroundColor: '#F4EEDB',
          height: 86,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Life':
              return <Ionicons name="business" size={size} color={color} />;
            case 'MissionsTab':
              return (
                <Ionicons name="checkmark-circle" size={size} color={color} />
              );
            case 'Home':
              return <Ionicons name="home" size={size} color={color} />;
            case 'Advisor':
              return (
                <Ionicons
                  name="chatbubble-ellipses"
                  size={size}
                  color={color}
                />
              );
            case 'Profile':
              return (
                <FontAwesome5 name="user-alt" size={size - 2} color={color} />
              );
            default:
              return <Ionicons name="ellipse" size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen
        name="Life"
        component={LifeScreen}
        options={{ title: 'Жизнь' }}
      />
      <Tab.Screen
        name="MissionsTab"
        component={MissionsNavigator}
        options={{ title: 'Цели' }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Дом' }}
      />
      <Tab.Screen
        name="Advisor"
        component={AdvisorScreen}
        options={{ title: 'Советы' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Профиль' }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  if (authLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}