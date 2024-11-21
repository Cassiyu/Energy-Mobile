import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import CustomPicker from '../components/CustomPicker';
import classifyDeviceEfficiency from '../utils/efficiencyClassification';
import IconLeft from '../components/IconLeft';
import LogoText from '../components/LogoText';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DeviceAnalysis, RootStackParamsList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';

const BASE_URL = 'http://energy-davinci.azurewebsites.net';

const EfficiencyAnalysis = () => {
  const [devicesAnalysis, setDevicesAnalysis] = useState<DeviceAnalysis[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  const navigation = useNavigation<StackNavigationProp<RootStackParamsList>>();

  useEffect(() => {
    loadDevicesAndCalculateAnalysis();
  }, []);

  const loadDevicesAndCalculateAnalysis = async () => {
    try {
      const userId = await AsyncStorage.getItem('userToken');
      if (!userId) {
        alert('Usuário não autenticado.');
        return;
      }

      const response = await axios.get(`${BASE_URL}/devices`);
      const devicesFromAPI = response.data;

      const filteredDevices = devicesFromAPI.filter(
        (device: any) => device.user?.userId === userId
      );

      const enhancedDevices = addMockDataToDevices(filteredDevices);
      const calculatedData = calculateEfficiency(enhancedDevices, userId);
      setDevicesAnalysis(calculatedData);
    } catch (error) {
      console.error('Erro ao carregar dispositivos da API:', error);
    }
  };

  const addMockDataToDevices = (devices: any[]) => {
    return devices.map(device => {
      const deviceTypeConfig = {
        'Ar Condicionado': { minWatts: 1000, maxWatts: 3000 },
        'Fogão': { minWatts: 800, maxWatts: 1500 },
        'Micro-ondas': { minWatts: 600, maxWatts: 1200 },
        'Forno elétrico': { minWatts: 1000, maxWatts: 2500 },
        'Lâmpada': { minWatts: 5, maxWatts: 100 },
        'Lavador de roupa': { minWatts: 500, maxWatts: 1500 },
        'Refrigerador': { minWatts: 100, maxWatts: 400 },
        'Televisor': { minWatts: 50, maxWatts: 400 },
        'Ventilador': { minWatts: 20, maxWatts: 100 },
      } as const;

      const config = deviceTypeConfig[device.deviceType as keyof typeof deviceTypeConfig];
      const generateRandomValue = (min: number, max: number): number => Math.random() * (max - min) + min;
      const mockWatts = config ? Math.round(generateRandomValue(config.minWatts, config.maxWatts)) : 1000;

      return {
        ...device,
        deviceCurrentWatts: mockWatts,
      };
    });
  };

  const calculateEfficiency = (devices: any[], userId: string) => {
    return devices.map(data => {
      const estimatedUsageHours = data.estimatedUsageHours || '1';
      const dailyUsage = data.deviceCurrentWatts * parseFloat(estimatedUsageHours) / 1000;
      const monthlyUsage = dailyUsage * 30;

      const efficiencyClass = classifyDeviceEfficiency(data.deviceType, monthlyUsage);

      return {
        deviceAnalysId: Math.random(),
        device: {
          deviceId: data.deviceId,
          deviceName: data.deviceName,
          deviceType: data.deviceType,
          estimatedUsageHours: data.estimatedUsageHours,
        },
        user: { userId },
        deviceCurrentWatts: data.deviceCurrentWatts,
        energyUsageMonthly: Number(monthlyUsage.toFixed(2)),
        efficiencyClass: efficiencyClass,
      };
    });
  };

  const renderItem = ({ item }: { item: DeviceAnalysis }) => (
    <View style={styles.deviceItem}>
      <Text style={styles.deviceName}>Dispositivo: {item.device.deviceName}</Text>
      <Text>Tipo: {item.device.deviceType}</Text>
      <Text>Potência Registrada: {item.deviceCurrentWatts} watts</Text>
      <Text>Horas Estimadas de Uso: {item.device.estimatedUsageHours} horas/dia</Text>
      <Text>Consumo Mensal: {item.energyUsageMonthly} kWh</Text>
      <Text>Classificação de Eficiência: {item.efficiencyClass}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconLeftContainer}>
          <IconLeft onPress={() => navigation.navigate('Menu')} />
        </View>
        <View style={styles.logoContainer}>
          <LogoText />
        </View>
      </View>
      <Text style={styles.title}>Análise de Eficiência dos Dispositivos</Text>
      <CustomPicker
        selectedValue={selectedDevice}
        onValueChange={setSelectedDevice}
        options={devicesAnalysis.map(device => ({
          label: `${device.device.deviceName} - ${device.device.deviceType}`,
          value: device.device.deviceName
        }))}
        placeholder="Selecione um dispositivo"
      />
      <Button title="Atualizar Análises" onPress={loadDevicesAndCalculateAnalysis} />
      <FlatList
        data={devicesAnalysis.filter(device => !selectedDevice || device.device.deviceName === selectedDevice)}
        renderItem={renderItem}
        keyExtractor={(item) => item.device.deviceId.toString()}
        style={styles.deviceList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  iconLeftContainer: {
    position: 'absolute',
    left: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  deviceList: {
    marginTop: 16,
  },
  deviceItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    padding: 16,
    elevation: 2,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default EfficiencyAnalysis;
