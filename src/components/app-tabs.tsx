import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useColorScheme } from 'react-native';

import Home from '@/app/index';
import Explore from '@/app/explore';

const Tab = createMaterialTopTabNavigator();

export default function AppTabs() {
  const scheme = useColorScheme();

  return (
    <Tab.Navigator
      screenOptions={{
        swipeEnabled: true,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen 
        name="Home"
        component={Home}
      />

      <Tab.Screen
        name="Explore"
        component={Explore}
      />
    </Tab.Navigator>
  );
}
