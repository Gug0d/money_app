// src/navigation/AppNavigator.tsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  NavigationContainer,
  NavigatorScreenParams,
  useNavigation,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { onAuthStateChanged, User } from 'firebase/auth';

import HouseholdScreen from '../screens/life/HouseholdScreen';
import HomeScreen from '../screens/home/HomeScreen';
import MissionsScreen from '../screens/missions/MissionsScreen';
import MissionDetailsScreen, {
  MissionsStackParamList,
} from '../screens/missions/MissionDetailsScreen';
import LifeScreen from '../screens/life/LifeScreen';
import BankScreen from '../screens/life/BankScreen';
import MortgageOffersScreen from '../screens/life/MortgageOffersScreen';
import AdvisorScreen from '../screens/advisor/AdvisorScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChallengesScreen from '../screens/life/ChallengesScreen';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import TutorialFlowModal from '../components/tutorial/TutorialFlowModal';
import {
  TutorialActionTarget,
  getNextTutorialFlowForLevel,
} from '../data/tutorials';

import { auth } from '../services/firebase';
import { useGame } from '../store/GameContext';

export type LifeStackParamList = {
  LifeMain: undefined;
  Bank: undefined;
  MortgageOffers: undefined;
  Household: undefined;
  Challenges: undefined;
};

export type RootTabParamList = {
  Life: NavigatorScreenParams<LifeStackParamList> | undefined;
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
  Main: NavigatorScreenParams<RootTabParamList> | undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const MissionsStack = createNativeStackNavigator<MissionsStackParamList>();
const LifeStack = createNativeStackNavigator<LifeStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

const BANK_UNLOCK_LEVEL = 2;
const BANK_UNLOCK_NOTIFICATION_ID = 'bank-unlocked-notification-v5';

const FIRST_START_TUTORIAL_ID = 'first-start';

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

function LifeNavigator() {
  return (
    <LifeStack.Navigator screenOptions={{ headerShown: false }}>
      <LifeStack.Screen name="LifeMain" component={LifeScreen} />
      <LifeStack.Screen name="Bank" component={BankScreen} />
      <LifeStack.Screen
        name="MortgageOffers"
        component={MortgageOffersScreen}
      />
      <LifeStack.Screen name="Household" component={HouseholdScreen} />
      <LifeStack.Screen name="Challenges" component={ChallengesScreen} />
    </LifeStack.Navigator>
  );
}

function MainTabs({
  guestMode,
  exitGuestMode,
}: {
  guestMode: boolean;
  exitGuestMode: () => void;
}) {
  const navigation = useNavigation<any>();

  const previousLevelRef = useRef<number | null>(null);
  const previousViewedTutorialIdsRef = useRef<string[] | null>(null);

  const { level, isGameLoading, viewedTutorialIds, markTutorialViewed } =
    useGame();

  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [isTutorialTestMode, setIsTutorialTestMode] = useState(false);

  const activeTutorialFlow = useMemo(
    () => getNextTutorialFlowForLevel(level, viewedTutorialIds),
    [level, viewedTutorialIds]
  );

  useEffect(() => {
    if (isGameLoading || !activeTutorialFlow) {
      return;
    }

    if (
      activeTutorialFlow.id === FIRST_START_TUTORIAL_ID &&
      !isTutorialTestMode
    ) {
      return;
    }

    setTutorialVisible(true);
  }, [isGameLoading, activeTutorialFlow, isTutorialTestMode]);

  useEffect(() => {
    if (isGameLoading) {
      return;
    }

    const previousViewedTutorialIds = previousViewedTutorialIdsRef.current;
    previousViewedTutorialIdsRef.current = viewedTutorialIds;

    if (!previousViewedTutorialIds) {
      return;
    }

    const tutorialWasReset =
      previousViewedTutorialIds.length > 0 && viewedTutorialIds.length === 0;

    if (!tutorialWasReset) {
      return;
    }

    setTutorialVisible(false);
    setIsTutorialTestMode(true);

    navigation.navigate('Main', {
      screen: 'Life',
      params: {
        screen: 'LifeMain',
      },
    });

    setTimeout(() => {
      setTutorialVisible(true);
    }, 500);
  }, [isGameLoading, viewedTutorialIds, navigation]);

  useEffect(() => {
    if (isGameLoading) return;

    if (previousLevelRef.current === null) {
      previousLevelRef.current = level;
      return;
    }

    const previousLevel = previousLevelRef.current;
    previousLevelRef.current = level;

    const reachedBankLevel =
      previousLevel < BANK_UNLOCK_LEVEL && level >= BANK_UNLOCK_LEVEL;

    if (!reachedBankLevel) return;

    if (viewedTutorialIds.includes(BANK_UNLOCK_NOTIFICATION_ID)) {
      return;
    }

    markTutorialViewed(BANK_UNLOCK_NOTIFICATION_ID);

    Alert.alert(
      'Банк открыт!',
      'Поздравляем! Ты достиг 2 уровня. Теперь тебе доступен раздел «Банк». Там можно открывать вклады, брать кредиты и пользоваться финансовыми инструментами.',
      [
        {
          text: 'Позже',
          style: 'cancel',
        },
        {
          text: 'Открыть банк',
          onPress: () => {
            navigation.navigate('Main', {
              screen: 'Life',
              params: {
                screen: 'Bank',
              },
            });
          },
        },
      ]
    );
  }, [
    isGameLoading,
    level,
    viewedTutorialIds,
    markTutorialViewed,
    navigation,
  ]);

  const handleNavigateToTutorialTarget = (target: TutorialActionTarget) => {
    switch (target) {
      case 'home':
        navigation.navigate('Main', {
          screen: 'Home',
        });
        break;

      case 'life':
        navigation.navigate('Main', {
          screen: 'Life',
          params: {
            screen: 'LifeMain',
          },
        });
        break;

      case 'profile':
        navigation.navigate('Main', {
          screen: 'Profile',
        });
        break;

      case 'household':
        navigation.navigate('Main', {
          screen: 'Life',
          params: {
            screen: 'Household',
          },
        });
        break;

      case 'challenges':
        navigation.navigate('Main', {
          screen: 'Life',
          params: {
            screen: 'Challenges',
          },
        });
        break;

      case 'bank':
        navigation.navigate('Main', {
          screen: 'Life',
          params: {
            screen: 'Bank',
          },
        });
        break;

      case 'missions':
        navigation.navigate('Main', {
          screen: 'MissionsTab',
          params: {
            screen: 'MissionsList',
          },
        });
        break;

      case 'advisor':
        navigation.navigate('Main', {
          screen: 'Advisor',
        });
        break;

      case 'none':
      default:
        break;
    }
  };

  const handleStartGameTutorial = () => {
    if (isGameLoading || !activeTutorialFlow) {
      return;
    }

    if (activeTutorialFlow.id !== FIRST_START_TUTORIAL_ID) {
      return;
    }

    if (viewedTutorialIds.includes(FIRST_START_TUTORIAL_ID)) {
      return;
    }

    setTutorialVisible(false);
    setIsTutorialTestMode(false);

    setTimeout(() => {
      setTutorialVisible(true);
    }, 450);
  };

  const handleFinishTutorial = async () => {
    if (activeTutorialFlow) {
      await markTutorialViewed(activeTutorialFlow.id);
    }

    setTutorialVisible(false);
    setIsTutorialTestMode(false);
  };

  return (
    <>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#0C6B61',
          tabBarInactiveTintColor: '#0C6B61',
          tabBarStyle: {
            display: 'none',
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
          component={LifeNavigator}
          options={{ title: 'Жизнь' }}
          listeners={({ navigation: tabNavigation }) => ({
            tabPress: (e) => {
              e.preventDefault();

              tabNavigation.navigate('Life', {
                screen: 'LifeMain',
              });
            },
          })}
        />

        <Tab.Screen
          name="MissionsTab"
          component={MissionsNavigator}
          options={{ title: 'Цели' }}
        />

        <Tab.Screen name="Home" options={{ title: 'Дом' }}>
          {(props) => (
            <HomeScreen
              {...props}
              onPlayPress={handleStartGameTutorial}
            />
          )}
        </Tab.Screen>

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

      <TutorialFlowModal
        visible={tutorialVisible}
        flow={activeTutorialFlow}
        onFinish={handleFinishTutorial}
        onNavigateToTarget={handleNavigateToTutorialTarget}
      />
    </>
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
  const [guestMode, setGuestMode] = useState(false);

  const { isGameLoading } = useGame();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return unsubscribeAuth;
  }, []);

  if (authLoading || (!guestMode && user && isGameLoading)) {
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