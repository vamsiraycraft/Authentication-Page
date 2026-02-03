import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// STEP 1: Import screens one by one to see which one is "undefined"
import LoginScreen from './app/(auth)/login';
import RegisterScreen from './app/(auth)/register';

// DEBUG LOGS - Look at your terminal/console!
console.log("LoginScreen Type:", typeof LoginScreen); 
console.log("RegisterScreen Type:", typeof RegisterScreen);

const Stack = createNativeStackNavigator();

export default function App() {
  // If either log says "undefined" or "object", that specific file is missing an 'export default'
  if (typeof LoginScreen !== 'function' || typeof RegisterScreen !== 'function') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'red' }}>
        <Text style={{ color: 'white' }}>Fix your exports! One of your screens is undefined.</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}