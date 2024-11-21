import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import axios from 'axios';
import IconLeft from '../components/IconLeft';
import LogoText from '../components/LogoText';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import EditMeterModal from '../components/EditMeterModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EnergyMeter, RootStackParamsList } from '../types/navigation';

const BASE_URL = 'http://energy-davinci.azurewebsites.net';

const RegisterMeter = () => {
    const [meterName, setMeterName] = useState('');
    const [energyMeters, setEnergyMeters] = useState<EnergyMeter[]>([]);
    const [devices, setDevices] = useState<any[]>([]);
    const [editingMeterId, setEditingMeterId] = useState<number | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMeterName, setModalMeterName] = useState('');

    const navigation = useNavigation<StackNavigationProp<RootStackParamsList>>();

    useEffect(() => {
        loadEnergyMetersFromAPI();
        loadDevicesFromAPI();
    }, []);

    const loadEnergyMetersFromAPI = async () => {
        try {
            const userId = await AsyncStorage.getItem('userToken');
            if (!userId) {
                alert('Usuário não autenticado.');
                return;
            }

            const response = await axios.get(`${BASE_URL}/energy-meters`);
            const filteredMeters = response.data.filter((meter: EnergyMeter) => meter.user?.userId === userId);
            console.log("Medidores filtrados pelo usuário logado:", filteredMeters);
            setEnergyMeters(filteredMeters);
        } catch (error) {
            console.error("Erro ao carregar medidores de energia da API:", error);
        }
    };


    const loadDevicesFromAPI = async () => {
        try {
            const userId = await AsyncStorage.getItem('userToken');
            if (!userId) {
                alert('Usuário não autenticado.');
                return;
            }
            const response = await axios.get(`${BASE_URL}/devices`, {
                params: {
                    userId: userId
                }
            });
            setDevices(response.data);
        } catch (error) {
            console.error("Erro ao carregar dispositivos da API:", error);
        }
    };


    const handleAddEnergyMeter = async () => {
        if (!meterName.trim()) {
            alert('O nome do medidor não pode ser nulo ou vazio.');
            return;
        }

        try {
            const userId = await AsyncStorage.getItem('userToken');
            if (!userId) {
                alert('Usuário não autenticado.');
                return;
            }

            const existingMeter = energyMeters.find(
                (meter) =>
                    meter.meterName.trim().toLowerCase() === meterName.trim().toLowerCase() &&
                    meter.user?.userId === userId
            );

            if (existingMeter) {
                alert('Já existe um medidor com este nome para o seu usuário.');
                return;
            }

            const response = await axios.post(`${BASE_URL}/energy-meters`, {
                meterName: meterName.trim(),
                user: {
                    userId: userId,
                }
            });
            console.log("Dados do medidor salvos na API com sucesso:", response.data);
            setEnergyMeters([...energyMeters, response.data]);
            setMeterName('');
        } catch (error) {
            const err = error as any;
            console.error('Erro ao adicionar medidor de energia na API:', err.message);
        }
    };

    const handleEditMeter = (meter: EnergyMeter) => {
        setModalMeterName(meter.meterName);
        setEditingMeterId(meter.energyMeterId);
        setIsModalVisible(true);
    };

    const handleSaveModal = async (name: string) => {
        if (editingMeterId !== null) {
            const userId = await AsyncStorage.getItem('userToken');
            if (!userId) {
                alert('Usuário não autenticado.');
                return;
            }

            const existingMeter = energyMeters.find(
                (meter) =>
                    meter.meterName.trim().toLowerCase() === name.trim().toLowerCase() &&
                    meter.user?.userId === userId &&
                    meter.energyMeterId !== editingMeterId
            );

            if (existingMeter) {
                alert('Já existe um medidor com este nome para o seu usuário.');
                return;
            }

            try {
                await axios.put(`${BASE_URL}/energy-meters/${editingMeterId}`, { meterName: name.trim() });
                const updatedMeters = energyMeters.map((meter) =>
                    meter.energyMeterId === editingMeterId ? { ...meter, meterName: name.trim() } : meter
                );
                setEnergyMeters(updatedMeters);
                setEditingMeterId(null);
                setIsModalVisible(false);
            } catch (error) {
                console.error("Erro ao atualizar medidor de energia na API:", error);
            }
        }
    };

    const handleDeleteMeter = async (energyMeterId: number) => {
        const associatedDevices = devices.filter(device => device.energyMeter.energyMeterId === energyMeterId);

        if (associatedDevices.length > 0) {
            Alert.alert(
                "Excluir Medidor",
                `Este medidor está associado a ${associatedDevices.length} dispositivo(s). Se você continuar, o(s) dispositivo(s), análises e relatórios também serão excluídos.`,
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Excluir",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                for (const device of associatedDevices) {
                                    // Remover análises associadas ao dispositivo
                                    const deviceAnalysisResponse = await axios.get(`${BASE_URL}/device-analysis`);
                                    const deviceAnalyses = deviceAnalysisResponse.data.filter((analysis: any) => analysis.device.deviceId === device.deviceId);

                                    for (const analysis of deviceAnalyses) {
                                        // Excluir relatórios associados à análise
                                        const reportResponse = await axios.get(`${BASE_URL}/reports`);
                                        const reports = reportResponse.data.filter((report: any) => report.deviceAnalysis.deviceAnalysisId === analysis.deviceAnalysisId);

                                        for (const report of reports) {
                                            await axios.delete(`${BASE_URL}/reports/${report.reportId}`);
                                        }

                                        // Excluir a própria análise
                                        await axios.delete(`${BASE_URL}/device-analysis/${analysis.deviceAnalysisId}`);
                                    }

                                    // Excluir o dispositivo
                                    await axios.delete(`${BASE_URL}/devices/${device.deviceId}`);
                                }

                                // Excluir o medidor de energia
                                await axios.delete(`${BASE_URL}/energy-meters/${energyMeterId}`);
                                setEnergyMeters(energyMeters.filter((meter) => meter.energyMeterId !== energyMeterId));
                            } catch (error) {
                                console.error("Erro ao excluir medidor, dispositivos, análises ou relatórios associados na API:", error);
                            }
                        },
                    },
                ],
                { cancelable: false }
            );
        } else {
            Alert.alert(
                "Excluir Medidor",
                "Você tem certeza que deseja excluir este medidor?",
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Excluir",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await axios.delete(`${BASE_URL}/energy-meters/${energyMeterId}`);
                                setEnergyMeters(energyMeters.filter((meter) => meter.energyMeterId !== energyMeterId));
                            } catch (error) {
                                console.error("Erro ao excluir medidor de energia na API:", error);
                            }
                        },
                    },
                ],
                { cancelable: false }
            );
        }
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
            <Text style={styles.title}>Cadastro de Medidores de Energia</Text>
            <Input placeText="Nome do Medidor" value={meterName} onChangeText={setMeterName} />
            <Button title="Adicionar Medidor" onPress={handleAddEnergyMeter} />

            <FlatList
                data={energyMeters}
                renderItem={({ item }) => (
                    <View style={styles.meterItem}>
                        <Text style={styles.meterName}>{item.meterName}</Text>
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity onPress={() => handleEditMeter(item)}>
                                <Text style={styles.buttonText}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteMeter(item.energyMeterId)}>
                                <Text style={styles.buttonText}>Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                keyExtractor={(item) => (item.energyMeterId ? item.energyMeterId.toString() : Math.random().toString())}
                style={styles.deviceList}
            />

            {isModalVisible && (
                <EditMeterModal
                    isVisible={isModalVisible}
                    meterName={modalMeterName}
                    onSave={handleSaveModal}
                    onClose={() => setIsModalVisible(false)}
                />
            )}
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
    meterItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 8,
        padding: 16,
        elevation: 2,
    },
    meterName: {
        fontSize: 18,
        fontWeight: 'bold',
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
    deviceList: {
        marginTop: 16,
    },
});

export default RegisterMeter;
