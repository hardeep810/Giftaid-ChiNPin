import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginForm from './components/LoginForm';
import ThankYouPage from './components/ThankYouPage';
import UserProfile from './components/UserProfile';
import WisePadTerminal from './components/WisePadTerminal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  

  

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await AsyncStorage.getItem('AuthUserID');
      setIsLoggedIn(loggedIn === 'true');
    };

    checkLoginStatus();
  }, []);

  if (isLoggedIn === null) {return null;} // Optionally show a loading state

  // if (!isLoggedIn) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Home' : 'Login'}>
        <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginForm} options={{ headerShown: false }} />
        <Stack.Screen name="ThankYou" component={ThankYouPage} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );

}

const TabNavigator = () => (
  <Tab.Navigator screenOptions={{
    tabBarStyle: { backgroundColor: '#333' },
    tabBarActiveTintColor: '#26B99A',
    tabBarInactiveTintColor: '#bdc3c7',
  }}
  >
    <Tab.Screen name="Donations" component={WisePadTerminal} options={{ 
      headerShown: false,
      tabBarIcon: ({ size }) => <Icon name="hand-heart" size={size} color="#26B99A" />,
     }} />
    {/* <Tab.Screen name="Wisepad" component={WisePadTerminal} options={{
      headerShown: false,
      tabBarIcon: ({ size }) => <Icon name="account" size={size} color="white" />,
      }} /> */}
    <Tab.Screen name="Profile" component={UserProfile} options={{
      headerShown: false,
      tabBarIcon: ({ size }) => <Icon name="account" size={size} color="white" />,
      }} />
  </Tab.Navigator>
);

export default App;
