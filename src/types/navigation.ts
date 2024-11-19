import { StackNavigationProp } from '@react-navigation/stack';

export interface Device {
  deviceId: number;
  deviceName: string;
  deviceType: string;
  energyMeter: {
    energyMeterId: number,
  };
  estimatedUsageHours: string;
  user: {
    userId: string,
  };
}

export interface EnergyMeter {
  energyMeterId: number;
  meterName: string;
  user: {
    userId: string,
  };
}

export interface DeviceAnalysis {
  deviceAnalysisId?: number;
  deviceCurrentWatts: number;
  energyUsageMonthly: number;
  efficiencyClass: string;
  device: {
    deviceId: number;
    deviceName: string;
    deviceType: string;
    estimatedUsageHours: string;
  };
  user: {
    userId: string;
  };
}

export interface Report {
  reportId?: number;
  generatedAt: string;
  deviceAnalysis: {
    deviceAnalysisId: number;
    deviceCurrentWatts?: number;
    energyUsageMonthly?: number;
    efficiencyClass?: string;
    device?: {
      deviceId: number;
      deviceName: string;
      deviceType: string;
      estimatedUsageHours: string;
    };
  };
  user: {
    userId: string;
  };
}

export type RootStackParamsList = {
  ReportGeneration: undefined;
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

