import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ref, get } from "firebase/database";
import { database, auth } from '../api/firebaseConfig';
import CustomPicker from '../components/CustomPicker';
import classifyDeviceEfficiency from '../mock/efficiencyClassification';
import IconLeft from '../components/IconLeft';
import LogoText from '../components/LogoText';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamsList } from '../types/navigation';

interface DeviceAnalysis {
  device_name: string;
  device_type: string;
  device_current_watts: number;
  estimated_usage_hours: string;
  energy_usage_monthly: number;
  efficiency_class: string;
}

const EfficiencyAnalysis = () => {
  const [devicesAnalysis, setDevicesAnalysis] = useState<DeviceAnalysis[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  const navigation = useNavigation<StackNavigationProp<RootStackParamsList>>();

  useEffect(() => {
    const loadDevicesFromFirebase = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.error('Usuário não autenticado');
          return;
        }

        const deviceRef = ref(database, `users/${userId}/devices`);
        const snapshot = await get(deviceRef);

        if (snapshot.exists()) {
          const devicesFromDB = snapshot.val();
          const deviceArray = Object.keys(devicesFromDB).map((key) => devicesFromDB[key]);
          const enhancedDevices = addMockDataToDevices(deviceArray);
          const calculatedData = calculateEfficiency(enhancedDevices);
          setDevicesAnalysis(calculatedData);
        } else {
          console.log("Nenhum dispositivo encontrado no banco de dados.");
        }
      } catch (error) {
        console.error("Erro ao carregar dispositivos do Firebase:", error);
      }
    };

    loadDevicesFromFirebase();
  }, []);

  const addMockDataToDevices = (devices: any[]) => {
    return devices.map(device => {
      const mockWatts = device.device_current_watts || Math.round(Math.random() * (3000 - 1000) + 1000); 

      return {
        ...device,
        device_current_watts: mockWatts,
      };
    });
  };

  const calculateEfficiency = (devices: any[]) => {
    return devices.map(data => {
      const estimatedUsageHours = data.estimated_usage_hours || '0';
      const dailyUsage = data.device_current_watts * parseFloat(estimatedUsageHours) / 1000;
      const monthlyUsage = dailyUsage * 30;

      let efficiencyClass = classifyDeviceEfficiency(data.device_type, monthlyUsage);

      return {
        device_name: data.device_name,
        device_type: data.device_type,
        device_current_watts: data.device_current_watts,
        estimated_usage_hours: estimatedUsageHours,
        energy_usage_monthly: Number(monthlyUsage.toFixed(2)),
        efficiency_class: efficiencyClass
      };
    });
  };

  const renderItem = ({ item }: { item: DeviceAnalysis }) => (
    <View style={styles.deviceItem}>
      <Text style={styles.deviceName}>Dispositivo: {item.device_name}</Text>
      <Text>Tipo: {item.device_type}</Text>
      <Text>Potência Registrada: {item.device_current_watts} watts</Text>
      <Text>Horas Estimadas de Uso: {item.estimated_usage_hours} horas/dia</Text>
      <Text>Consumo Mensal: {item.energy_usage_monthly} kWh</Text>
      <Text>Classificação de Eficiência: {item.efficiency_class}</Text>
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
        options={devicesAnalysis.map(device => ({ label: `${device.device_name} - ${device.device_type}`, value: device.device_name }))}
        placeholder="Selecione um dispositivo"
      />
      <FlatList
        data={devicesAnalysis.filter(device => !selectedDevice || device.device_name === selectedDevice)}
        renderItem={renderItem}
        keyExtractor={(item) => item.device_name}
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
    marginBottom: 16
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
