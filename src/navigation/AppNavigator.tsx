import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

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
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

import { auth, db } from '../services/firebase';

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
  Onboarding: undefined;
  Main: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const MissionsStack = createNativeStackNavigator<MissionsStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <SafeAreaView style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0A6A61" />
      <Text style={styles.loadingText}>Загрузка...</Text>
    </SafeAreaView>
  );
}

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

function MainTabs({
  guestMode,
  exitGuestMode,
}: {
  guestMode: boolean;
  exitGuestMode: () => void;
}) {
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
      <Tab.Screen name="Profile" options={{ title: 'Профиль' }}>
        {() => (
          <ProfileScreen
            guestMode={guestMode}
            exitGuestMode={exitGuestMode}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AuthNavigator({ onGuestLogin }: { onGuestLogin: () => void }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome">
        {(props) => <WelcomeScreen {...props} onGuestLogin={onGuestLogin} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userDocLoading, setUserDocLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = undefined;
      }

      if (!firebaseUser) {
        setOnboardingCompleted(false);
        setAuthLoading(false);
        setUserDocLoading(false);
        return;
      }

      setAuthLoading(false);
      setUserDocLoading(true);

      unsubscribeUserDoc = onSnapshot(
        doc(db, 'users', firebaseUser.uid),
        (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setOnboardingCompleted(!!userData.onboardingCompleted);
          } else {
            setOnboardingCompleted(false);
          }
          setUserDocLoading(false);
        },
        () => {
          setOnboardingCompleted(false);
          setUserDocLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }
    };
  }, []);

  if (authLoading || (!guestMode && user && userDocLoading)) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {guestMode ? (
          <RootStack.Screen name="Main">
            {() => (
              <MainTabs
                guestMode={guestMode}
                exitGuestMode={() => setGuestMode(false)}
              />
            )}
          </RootStack.Screen>
        ) : !user ? (
          <RootStack.Screen name="Auth">
            {() => <AuthNavigator onGuestLogin={() => setGuestMode(true)} />}
          </RootStack.Screen>
        ) : !onboardingCompleted ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <RootStack.Screen name="Main">
            {() => (
              <MainTabs
                guestMode={guestMode}
                exitGuestMode={() => setGuestMode(false)}
              />
            )}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F1E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#0A6A61',
  },
});