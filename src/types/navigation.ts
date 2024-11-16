import { StackNavigationProp } from '@react-navigation/stack';

export interface Device {
  device_id: string;
  device_name: string;
  device_type: string;
  device_watts: string;
  energy_meter_id: string;
}

export interface EnergyMeter {
  meter_id: string;
  meter_name: string;
}

export type RootStackParamsList = {
  ReportGeneration : undefined;
  EfficiencyAnalysis: undefined;
  RegisterDevice: undefined;
  RegisterMeter: undefined;
  Menu: undefined;
  Login: undefined;
  SignUp: undefined;
  Settings: undefined;
};

export type LoginNavigationProp = StackNavigationProp<
  RootStackParamsList,
  'Login'
>;

export type SignUpNavigationProp = StackNavigationProp<
  RootStackParamsList,
  'SignUp'
>;

