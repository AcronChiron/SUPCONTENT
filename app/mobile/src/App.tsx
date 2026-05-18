import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import LibraryScreen from './screens/LibraryScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ConversationsScreen from './screens/ConversationsScreen';
import ChatScreen from './screens/ChatScreen';
import MediaDetailScreen from './screens/MediaDetailScreen';
import ReviewDetailScreen from './screens/ReviewDetailScreen';
import ListsScreen from './screens/ListsScreen';
import ListDetailScreen from './screens/ListDetailScreen';
import UserProfileScreen from './screens/UserProfileScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0D0F1A' },
        headerTintColor: '#F0F2FF',
        contentStyle: { backgroundColor: '#0D0F1A' },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SUPCONTENT' }} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Library" component={LibraryScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Conversations" component={ConversationsScreen} options={{ title: 'Messages' }} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="MediaDetail" component={MediaDetailScreen} options={{ title: 'Detail' }} />
          <Stack.Screen name="ReviewDetail" component={ReviewDetailScreen} options={{ title: 'Critique' }} />
          <Stack.Screen name="Lists" component={ListsScreen} options={{ title: 'Mes listes' }} />
          <Stack.Screen name="ListDetail" component={ListDetailScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
