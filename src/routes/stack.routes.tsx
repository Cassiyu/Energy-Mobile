import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RootStackParamsList } from '../types/navigation'
import Menu from '../screens/Menu';
import RegisterDevice from '../screens/RegisterDevice';
import RegisterMeter from '../screens/RegisterMeter';
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import EfficiencyAnalysis from '../screens/EfficiencyAnalysis';
import ReportGeneration from '../screens/ReportGeneration';

const StackNavigator = createNativeStackNavigator<RootStackParamsList>()

const StackNavigation = () => {
    return (
      <StackNavigator.Navigator initialRouteName="Login">
        <StackNavigator.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <StackNavigator.Screen name="SignUp" component={SignUp} options={{ headerShown: false }}/>
        <StackNavigator.Screen name="Menu" component={Menu} options={{ headerShown: false }}/>
        <StackNavigator.Screen name="RegisterDevice" component={RegisterDevice} options={{ headerShown: false }}/>
        <StackNavigator.Screen name="RegisterMeter" component={RegisterMeter} options={{ headerShown: false }}/>
        <StackNavigator.Screen name="EfficiencyAnalysis" component={EfficiencyAnalysis} options={{ headerShown: false }}/>
        <StackNavigator.Screen name="ReportGeneration" component={ReportGeneration } options={{ headerShown: false }}/>
      </StackNavigator.Navigator>
    );
  };
  
  export default StackNavigation;