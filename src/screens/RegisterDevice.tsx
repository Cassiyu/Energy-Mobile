import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Input from '../components/Input';
import Button from '../components/Button';
import LogoText from '../components/LogoText';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamsList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomPicker from '../components/CustomPicker';
import { v4 as uuidv4 } from 'uuid';
import { ref, set, get, remove } from "firebase/database";
import { auth, database } from '../api/firebaseConfig';
import 'react-native-get-random-values';
import IconLeft from '../components/IconLeft';
import EditDeviceModal from '../components/EditDeviceModal';

interface Device {
  device_id: string;
  device_name: string;
  device_type: string;
  energy_meter_id: string;
  estimated_usage_hours: string;
}

interface EnergyMeter {
  meter_id: string;
  meter_name: string;
}

const RegisterDevice = () => {
  const [energyMeters, setEnergyMeters] = useState<EnergyMeter[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<string>(''); 
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [estimatedUsageHours, setEstimatedUsageHours] = useState('');
  const [timeUnit, setTimeUnit] = useState<'Horas' | 'Minutos'>('Horas');
  const [devices, setDevices] = useState<Device[]>([]);
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalSelectedMeter, setModalSelectedMeter] = useState<string>('');
  const [modalData, setModalData] = useState<{ name: string; type: string; hours: string; unit: 'Horas' | 'Minutos' }>({
    name: '',
    type: '',
    hours: '',
    unit: 'Horas',
  });

  const navigation = useNavigation<StackNavigationProp<RootStackParamsList>>();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');

        if (!userToken) {
          navigation.navigate('Login');
        } else {
          loadEnergyMetersFromFirebase(userToken);
          loadDevicesFromFirebase(userToken);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
      }
    };

    checkUserSession();
  }, []);

  const loadDevicesFromFirebase = async (userId: string) => {
    try {
      const deviceRef = ref(database, `users/${userId}/devices`);
      const snapshot = await get(deviceRef);

      if (snapshot.exists()) {
        const devicesFromDB = snapshot.val();
        const deviceArray = Object.keys(devicesFromDB).map((key) => devicesFromDB[key]);
        setDevices(deviceArray);
      } else {
        console.log("Nenhum dispositivo encontrado para o usuário.");
      }
    } catch (error) {
      console.error("Erro ao carregar dispositivos:", error);
    }
  };

  const loadEnergyMetersFromFirebase = async (userId: string) => {
    try {
      const meterRef = ref(database, `users/${userId}/energy_meters`);
      const snapshot = await get(meterRef);

      if (snapshot.exists()) {
        const metersFromDB = snapshot.val();
        const meterArray = Object.keys(metersFromDB).map((key) => metersFromDB[key]);
        setEnergyMeters(meterArray);
      } else {
        console.log("Nenhum medidor de energia encontrado para o usuário.");
      }
    } catch (error) {
      console.error("Erro ao carregar medidores de energia:", error);
    }
  };

  const handleAddDevice = async () => {
    if (deviceName && deviceType && selectedMeter && estimatedUsageHours) {
      const isDuplicate = devices.some(device => device.device_name === deviceName);
      const isMeterInUse = devices.some(device => device.energy_meter_id === selectedMeter);

      if (isDuplicate) {
        alert('Dispositivo já existe.');
        return;
      }

      if (isMeterInUse) {
        alert('Este medidor de energia já está em uso por outro dispositivo.');
        return;
      }

      let usageInHours = parseFloat(estimatedUsageHours);
      if (timeUnit === 'Minutos') {
        usageInHours = usageInHours / 60;
      }

      const newDevice: Device = {
        device_id: uuidv4(),
        device_name: deviceName,
        device_type: deviceType,
        energy_meter_id: selectedMeter,
        estimated_usage_hours: usageInHours.toFixed(2), 
      };

      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          throw new Error("Usuário não autenticado");
        }

        const deviceRef = ref(database, `users/${userId}/devices/${newDevice.device_id}`);
        await set(deviceRef, newDevice);

        setDevices([...devices, newDevice]);
        setDeviceName('');
        setDeviceType('');
        setSelectedMeter('');
        setEstimatedUsageHours('');
      } catch (error) {
        console.error("Erro ao salvar dispositivo no Firebase:", error);
      }
    } else {
      alert('Preencha todos os campos.');
    }
  };

  const handleEditDevice = (device: Device) => {
    const [value, unit] = device.estimated_usage_hours.split(' ');
    let usageValue = parseFloat(value);
    let usageUnit: 'Horas' | 'Minutos' = 'Horas';

    if (usageValue < 1) {
        usageValue = Math.round(usageValue * 60); 
        usageUnit = 'Minutos';
    } else {
        usageValue = parseFloat(value);
    }

    setModalData({
        name: device.device_name,
        type: device.device_type,
        hours: usageValue.toString(), 
        unit: usageUnit,
    });
    setEditingDeviceId(device.device_id);
    setModalSelectedMeter(device.energy_meter_id);
    setIsModalVisible(true);
};


  const handleSaveModal = (name: string, type: string, hours: string, unit: 'Horas' | 'Minutos', meter: string) => {
    handleUpdateDevice(name, type, hours, unit, meter);
    setIsModalVisible(false);
  };

  const handleUpdateDevice = async (
    name: string,
    type: string,
    hours: string,
    unit: 'Horas' | 'Minutos',
    selectedMeter: string 
  ) => {
    if (editingDeviceId) {
      let usageInHours = parseFloat(hours);
      if (unit === 'Minutos') {
        usageInHours = usageInHours / 60;
      }

      const updatedDevice: Device = {
        device_id: editingDeviceId,
        device_name: name,
        device_type: type,
        energy_meter_id: selectedMeter, 
        estimated_usage_hours: usageInHours.toFixed(2),
      };

      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          throw new Error("Usuário não autenticado");
        }

        const deviceRef = ref(database, `users/${userId}/devices/${editingDeviceId}`);
        await set(deviceRef, updatedDevice);

        const updatedDevices = devices.map((device) =>
          device.device_id === editingDeviceId ? updatedDevice : device
        );
        setDevices(updatedDevices);
        setDeviceName('');
        setDeviceType('');
        setModalSelectedMeter('');
        setEstimatedUsageHours('');
        setEditingDeviceId(null);
      } catch (error) {
        console.error("Erro ao atualizar dispositivo no Firebase:", error);
      }
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    Alert.alert(
      "Excluir Dispositivo",
      "Você tem certeza que deseja excluir este dispositivo?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const userId = auth.currentUser?.uid;
              if (!userId) {
                throw new Error("Usuário não autenticado");
              }

              const deviceRef = ref(database, `users/${userId}/devices/${deviceId}`);
              await remove(deviceRef);

              const filteredDevices = devices.filter((device) => device.device_id !== deviceId);
              setDevices(filteredDevices);
            } catch (error) {
              console.error("Erro ao excluir dispositivo no Firebase:", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderItem = ({ item }: { item: Device }) => {
    const meterName = energyMeters.find(meter => meter.meter_id === item.energy_meter_id)?.meter_name || 'Medidor não encontrado';

    return (
      <View style={styles.deviceItem}>
        <Text style={styles.deviceName}>{item.device_name}</Text>
        <Text style={styles.deviceType}>Tipo: {item.device_type}</Text>
        <Text style={styles.deviceMeter}>Medidor: {meterName}</Text>
        <Text style={styles.deviceUsage}>Tempo de Uso Diário: {item.estimated_usage_hours} hora(s)</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={() => handleEditDevice(item)}>
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteDevice(item.device_id)}>
            <Text style={styles.buttonText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

      <Text style={styles.title}>Cadastro de Dispositivos</Text>
      <CustomPicker
        selectedValue={selectedMeter}
        onValueChange={setSelectedMeter}
        options={energyMeters.map(meter => ({ label: meter.meter_name, value: meter.meter_id }))}
        placeholder="Selecione um Medidor de Energia"
      />
      <Input placeText="Nome do Dispositivo" value={deviceName} onChangeText={setDeviceName} />
      <CustomPicker
        selectedValue={deviceType}
        onValueChange={(itemValue: string) => setDeviceType(itemValue)}
        options={[
          { label: 'Ar Condicionado', value: 'Ar Condicionado' },
          { label: 'Fogão', value: 'Fogão' },
          { label: 'Micro-ondas', value: 'Micro-ondas' },
          { label: 'Forno elétrico', value: 'Forno elétrico' },
          { label: 'Lâmpada', value: 'Lâmpada' },
          { label: 'Lavador de roupa', value: 'Lavador de roupa' },
          { label: 'Refrigerador', value: 'Refrigerador' },
          { label: 'Televisor', value: 'Televisor' },
          { label: 'Ventilador', value: 'Ventilador' },
        ]}
        placeholder="Selecione o Tipo de Dispositivo"
      />
      <View style={styles.row}>
        <View style={styles.flexContainer}>
          <CustomPicker
            selectedValue={timeUnit}
            onValueChange={(itemValue: string) => setTimeUnit(itemValue as 'Horas' | 'Minutos')}
            options={[
              { label: 'Horas', value: 'Horas' },
              { label: 'Minutos', value: 'Minutos' },
            ]}
            placeholder="Unidade de Tempo"
          />
        </View>
        <View style={styles.flexContainer}>
          <Input
            placeText="Tempo de Uso Diário"
            value={estimatedUsageHours}
            onChangeText={setEstimatedUsageHours}
            style={styles.input}
          />
        </View>
      </View>

      <Button title="Adicionar Dispositivo" onPress={handleAddDevice} />

      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={(item) => item.device_id}
        style={styles.deviceList}
      />

      <EditDeviceModal
        isVisible={isModalVisible}
        deviceName={modalData.name}
        deviceType={modalData.type}
        estimatedUsageHours={modalData.hours}
        timeUnit={modalData.unit}
        selectedMeter={modalSelectedMeter}
        energyMeters={energyMeters}
        onMeterChange={setModalSelectedMeter}
        onSave={handleSaveModal}
        onClose={() => setIsModalVisible(false)}
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
  deviceType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deviceMeter: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deviceUsage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: '#1E3E69',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexContainer: {
    flex: 1,
  },
  input: {
    marginLeft: 8,
  },
});

export default RegisterDevice;

