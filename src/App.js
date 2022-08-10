/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useRef } from 'react';
import type { Node } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
// import { createDrawerNavigator } from '@react-navigation/drawer';

import { useColorScheme, LogBox, AppState } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import SplashScreen from 'react-native-splash-screen';
import T from '@/Utils/common';
import { store, persistor } from '@/Store/index';
import Scan from './Component/Screens/Scan';
import DefaultScreen from './Component/Screens';

window.T = T;

// const Drawer = createDrawerNavigator();
LogBox.ignoreLogs([
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components, check out new Gestures system!",
  'RCTBridge required dispatch_sync to load RNGestureHandlerModule. This may lead to deadlocks',
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed',
]);

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const appState = useRef(AppState.currentState);
  const appTheme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: '#0058c0',
      background: '#ffffff',
      text: '#000000',
      accent: '#f1c40f',
      error: '#dc3545',
      white: 'white',
    }
  };

  const init = async () => {
    try {
      SplashScreen.hide();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    // Quay trở lại app
    const subscription = AppState.addEventListener('change', nextAppState => {
      // if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      //     console.log('App has come to the foreground!');
      // }
      appState.current = nextAppState;
      if (!T.socket.connected && appState.current == 'active') {
        T.socket.connect();
        T.socket.emit('system:join');
      }
    });
    return () => {
      subscription.remove();
    };
  }, [appState.current]);
  return (
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <PaperProvider theme={appTheme}>
            <NavigationContainer>
              <DefaultScreen />
            </NavigationContainer>
          </PaperProvider>
        </PersistGate>
      </Provider>
  );
};

export default App;
