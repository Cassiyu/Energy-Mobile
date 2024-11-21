import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Input from '../components/Input';
import Button from '../components/Button';
import LogoText from '../components/LogoText';
import { useNavigation } from '@react-navigation/native';
import { Device, EnergyMeter, RootStackParamsList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomPicker from '../components/CustomPicker';
import axios from 'axios';
import IconLeft from '../components/IconLeft';
import EditDeviceModal from '../components/EditDeviceModal';

const BASE_URL = 'http://energy-davinci.azurewebsites.net';

const RegisterDevice = () => { 
  const [energyMeters, setEnergyMeters] = useState<EnergyMeter[]>([]);
  const [selectedMeter, setSelectedMeter] = useState<number | string | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [estimatedUsageHours, setEstimatedUsageHours] = useState('');
  const [timeUnit, setTimeUnit] = useState<'Horas' | 'Minutos'>('Horas');
  const [devices, setDevices] = useState<Device[]>([]);
  const [editingDeviceId, setEditingDeviceId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalSelectedMeter, setModalSelectedMeter] = useState<string | number | null>(null);
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
          loadDevicesFromAPI();
          loadEnergyMetersFromAPI();
        }
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
      }
    };
    checkUserSession();
  }, []);

  const loadDevicesFromAPI = async () => {
    try {
      const userId = await AsyncStorage.getItem('userToken');
      if (!userId) {
        alert('Usuário não autenticado.');
        return;
      }

      const response = await axios.get(`${BASE_URL}/devices`);

      const filteredDevices = response.data.filter((device: Device) => device.user?.userId === userId);
      console.log("Dispositivos filtrados para o usuário logado:", filteredDevices);
      setDevices(filteredDevices);
    } catch (error) {
      console.error('Erro ao carregar dispositivos da API:', error);
    }
  };

  const loadEnergyMetersFromAPI = async () => {
    try {
      const userId = await AsyncStorage.getItem('userToken');
      if (!userId) {
        alert('Usuário não autenticado.');
        return;
      }

      const response = await axios.get(`${BASE_URL}/energy-meters`);
      const filteredMeters = response.data.filter((meter: EnergyMeter) => meter.user?.userId === userId);
      console.log("Medidores de energia filtrados para o usuário logado:", filteredMeters);
      setEnergyMeters(filteredMeters);
    } catch (error) {
      console.error('Erro ao carregar medidores de energia da API:', error);
    }
  };


  const handleAddDevice = async () => {
    if (!deviceName || !deviceType || !selectedMeter || !estimatedUsageHours) {
      alert('Preencha todos os campos.');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userToken');
      console.log("Dados recebidos:", userId);
      if (!userId) {
        alert('Usuário não autenticado.');
        return;
      }
      const existingDevice = devices.find(
        (device) =>
          device.deviceName.toLowerCase() === deviceName.toLowerCase() &&
          device.user?.userId === userId
      );

      if (existingDevice) {
        alert('Já existe um dispositivo com este nome para o seu usuário.');
        return;
      }

      const isMeterInUse = devices.some(
        (device) => Number(device.energyMeter.energyMeterId) === Number(selectedMeter)
      );

      console.log('Selected Meter 1:', selectedMeter, typeof selectedMeter);


      if (isMeterInUse) {
        alert('Este medidor de energia já está em uso por outro dispositivo.');
        return;
      }

      let usageInHours = parseFloat(estimatedUsageHours);
      if (timeUnit === 'Minutos') {
        usageInHours = usageInHours / 60;
      }

      let selectedMeterNumber = Number(selectedMeter);

      const newDevice = {
        deviceName: deviceName.trim(),
        deviceType: deviceType,
        energyMeter: {
          energyMeterId: selectedMeterNumber,
        },
        estimatedUsageHours: parseFloat(usageInHours.toFixed(2)),
        user: {
          userId: userId,
        },
      };

      console.log('Selected Meter 2:', selectedMeterNumber, typeof selectedMeterNumber);

      console.log('Tentando adicionar dispositivo com os seguintes dados:', newDevice);

      const response = await axios.post(`${BASE_URL}/devices`, newDevice);
      setDevices([...devices, response.data]);
      setDeviceName('');
      setDeviceType('');
      setSelectedMeter(null);
      setEstimatedUsageHours('');
    } catch (error) {
      const err = error as any
      console.error('Erro ao adicionar dispositivo na API:', err.response?.data || err.message);
    }
  };

  const handleEditDevice = (device: Device) => {
    const [value, unit] = device.estimatedUsageHours.split(' ');
    let usageValue = parseFloat(value);
    let usageUnit: 'Horas' | 'Minutos' = 'Horas';

    if (usageValue < 1) {
      usageValue = Math.round(usageValue * 60);
      usageUnit = 'Minutos';
    } else {
      usageValue = parseFloat(value);
    }

    setModalData({
      name: device.deviceName,
      type: device.deviceType,
      hours: usageValue.toString(),
      unit: usageUnit,
    });
    setEditingDeviceId(device.deviceId);
    setModalSelectedMeter(String(device.energyMeter.energyMeterId));
    setIsModalVisible(true);
  };

  const handleSaveModal = (name: string, type: string, hours: string, unit: 'Horas' | 'Minutos', meter: string | number) => {
    const isMeterInUse = devices.some(
      (device) => device.energyMeter.energyMeterId === Number(meter) && device.deviceId !== editingDeviceId
    );

    if (isMeterInUse) {
      Alert.alert(
        'Aviso',
        'Este medidor de energia já está em uso por outro dispositivo.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    handleUpdateDevice(name, type, hours, unit, Number(meter));
    setIsModalVisible(false);
  };


  const handleUpdateDevice = async (
    name: string,
    type: string,
    hours: string,
    unit: 'Horas' | 'Minutos',
    selectedMeter: number
  ) => {
    if (editingDeviceId !== null) {
      const userId = await AsyncStorage.getItem('userToken');
      if (!userId) {
        alert('Usuário não autenticado.');
        return;
      }

      const existingDevice = devices.find(
        (device) =>
          device.deviceName.toLowerCase() === name.toLowerCase() &&
          device.user?.userId === userId &&
          device.deviceId !== editingDeviceId
      );

      if (existingDevice) {
        alert('Já existe um dispositivo com este nome para o seu usuário.');
        return;
      }

      let usageInHours = parseFloat(hours);
      if (unit === 'Minutos') {
        usageInHours = usageInHours / 60;
      }

      const updatedDevice: Device = {
        deviceId: editingDeviceId,
        deviceName: name.trim(),
        deviceType: type,
        energyMeter: {
          energyMeterId: selectedMeter,
        },
        estimatedUsageHours: usageInHours.toFixed(2),
        user: {
          userId: userId,
        },
      };

      try {
        await axios.put(`${BASE_URL}/devices/${editingDeviceId}`, updatedDevice);
        const updatedDevices = devices.map((device) =>
          device.deviceId === editingDeviceId ? updatedDevice : device
        );
        setDevices(updatedDevices);
        setDeviceName('');
        setDeviceType('');
        setModalSelectedMeter(null);
        setEstimatedUsageHours('');
        setEditingDeviceId(null);
      } catch (error) {
        console.error('Erro ao atualizar dispositivo na API:', error);
      }
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    Alert.alert(
      "Excluir Dispositivo",
      "Você tem certeza que deseja excluir este dispositivo? Análises e relatórios associados também serão excluídos.",
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
              const deviceAnalysisResponse = await axios.get(`${BASE_URL}/device-analysis`);
              const deviceAnalyses = deviceAnalysisResponse.data.filter((analysis: any) => analysis.device.deviceId === deviceId);

              for (const analysis of deviceAnalyses) {

                const reportResponse = await axios.get(`${BASE_URL}/reports`);
                const reports = reportResponse.data.filter((report: any) => report.deviceAnalysis.deviceAnalysisId === analysis.deviceAnalysisId);

                for (const report of reports) {
                  await axios.delete(`${BASE_URL}/reports/${report.reportId}`);
                }

                await axios.delete(`${BASE_URL}/device-analysis/${analysis.deviceAnalysisId}`);
              }
              await axios.delete(`${BASE_URL}/devices/${deviceId}`);
              const filteredDevices = devices.filter(device => device.deviceId !== deviceId);
              setDevices(filteredDevices);
            } catch (error) {
              console.error('Erro ao excluir dispositivo, análises ou relatórios na API:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderItem = ({ item }: { item: Device }) => {
    const meterName = energyMeters.find(meter => meter.energyMeterId === item.energyMeter.energyMeterId)?.meterName || 'Medidor não encontrado';

    return (
      <View style={styles.deviceItem}>
        <Text style={styles.deviceName}>{item.deviceName}</Text>
        <Text style={styles.deviceType}>Tipo: {item.deviceType}</Text>
        <Text style={styles.deviceMeter}>Medidor: {meterName}</Text>
        <Text style={styles.deviceUsage}>Tempo de Uso Diário: {item.estimatedUsageHours} hora(s)</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={() => handleEditDevice(item)}>
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteDevice(item.deviceId)}>
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
        selectedValue={String(selectedMeter) ?? ''}
        onValueChange={(itemValue: string) => setSelectedMeter(itemValue)}
        options={energyMeters.map(meter => ({ label: meter.meterName, value: String(meter.energyMeterId) }))}
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
        keyExtractor={(item) => item.deviceId.toString()}
        style={styles.deviceList}
      />

      <EditDeviceModal
        isVisible={isModalVisible}
        deviceName={modalData.name}
        deviceType={modalData.type}
        estimatedUsageHours={modalData.hours}
        timeUnit={modalData.unit}
        selectedMeter={modalSelectedMeter ?? ''}
        energyMeters={energyMeters}
        onMeterChange={(value) => setModalSelectedMeter(value)}
        onSave={(name, type, hours, unit, meter) => handleSaveModal(name, type, hours, unit, Number(meter))}
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