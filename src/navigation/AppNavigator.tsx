import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import HomeScreen from '../screens/home/HomeScreen';
import MissionsScreen from '../screens/missions/MissionsScreen';
import MissionDetailsScreen, {
  MissionsStackParamList,
} from '../screens/missions/MissionDetailsScreen';
import LifeScreen from '../screens/life/LifeScreen';
import AdvisorScreen from '../screens/advisor/AdvisorScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { NavigatorScreenParams } from '@react-navigation/native';




export type RootTabParamList = {
  Life: undefined;
  MissionsTab: NavigatorScreenParams<MissionsStackParamList> | undefined;
  Home: undefined;
  Advisor: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const MissionsStack = createNativeStackNavigator<MissionsStackParamList>();

function MissionsNavigator() {
  return (
    <MissionsStack.Navigator screenOptions={{ headerShown: false }}>
      <MissionsStack.Screen name="MissionsList" component={MissionsScreen} />
      <MissionsStack.Screen name="MissionDetails" component={MissionDetailsScreen} />
    </MissionsStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
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
                return <Ionicons name="checkmark-circle" size={size} color={color} />;
              case 'Home':
                return <Ionicons name="home" size={size} color={color} />;
              case 'Advisor':
                return <Ionicons name="chatbubble-ellipses" size={size} color={color} />;
              case 'Profile':
                return <FontAwesome5 name="user-alt" size={size - 2} color={color} />;
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
    </NavigationContainer>
  );
}