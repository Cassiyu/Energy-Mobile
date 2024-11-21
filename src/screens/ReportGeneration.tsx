import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, Modal, ScrollView } from 'react-native';
import axios from 'axios';
import Button from '../components/Button';
import IconLeft from '../components/IconLeft';
import LogoText from '../components/LogoText';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Device, DeviceAnalysis, Report, RootStackParamsList } from '../types/navigation';
import classifyDeviceEfficiency from '../utils/efficiencyClassification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomPicker from '../components/CustomPicker';

const BASE_URL = 'http://energy-davinci.azurewebsites.net';

const ReportGeneration = () => {
    const [deviceAnalysis, setDeviceAnalysis] = useState<DeviceAnalysis[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const navigation = useNavigation<StackNavigationProp<RootStackParamsList>>();

    useFocusEffect(
        React.useCallback(() => {
            loadDevicesFromAPI();
            generateMockDataAndAnalysis();
            loadReportsFromAPI();
        }, [])
    );

    useEffect(() => {
        if (devices.length > 0) {
            generateMockDataAndAnalysis();
        }
    }, [devices, selectedDeviceId]);

    const [dataLoaded, setDataLoaded] = useState(false);

    const loadData = async () => {
        if (!dataLoaded) {
            await loadDevicesFromAPI();
            await generateMockDataAndAnalysis();
            await loadReportsFromAPI();
            setDataLoaded(true);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const generateMockDataAndAnalysis = async () => {
        try {
            const userId = await AsyncStorage.getItem('userToken');
            if (!userId) {
                alert('Usuário não autenticado.');
                return;
            }
            const selectedDevice = devices.find(
                device => device.deviceId.toString() === selectedDeviceId && device.user?.userId === userId
            );

            if (!selectedDevice || isNaN(selectedDevice.deviceId)) {
                console.log(selectedDevice, '=> Nenhum dispositivo selecionado');
                return;
            }

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

            const config = deviceTypeConfig[selectedDevice.deviceType as keyof typeof deviceTypeConfig];
            if (!config) {
                console.error('Tipo de dispositivo desconhecido:', selectedDevice.deviceType);
                return;
            }

            const generateRandomValue = (min: number, max: number): number => Math.random() * (max - min) + min;
            const deviceCurrentWatts = Math.round(generateRandomValue(config.minWatts, config.maxWatts));
            const usageHours = generateRandomValue(1, 24);
            const energyUsageMonthly = Number((deviceCurrentWatts * usageHours / 1000 * 30).toFixed(2));

            const deviceAnalysisData = [{
                deviceAnalysisId: 0,
                deviceCurrentWatts,
                energyUsageMonthly,
                efficiencyClass: classifyDeviceEfficiency(selectedDevice.deviceType, energyUsageMonthly),
                device: {
                    deviceId: Number(selectedDevice.deviceId),
                    deviceName: selectedDevice.deviceName,
                    deviceType: selectedDevice.deviceType,
                    estimatedUsageHours: selectedDevice.estimatedUsageHours,
                },
                user: { userId },
            }];

            setDeviceAnalysis(deviceAnalysisData);
        } catch (error) {
            console.error('Erro ao gerar dados de análise com mock:', error);
        }
    };


    const loadDevicesFromAPI = async () => {
        try {
            const userId = await AsyncStorage.getItem('userToken');
            if (!userId) {
                alert('Usuário não autenticado.');
                return;
            }

            const response = await axios.get(`${BASE_URL}/devices`);
            const filteredDevices = response.data.filter((device: Device) => device.user?.userId === userId);
            setDevices(filteredDevices);
        } catch (error) {
            console.error('Erro ao carregar dispositivos da API:', error);
        }
    };

    const loadReportsFromAPI = async () => {
        try {
            const userId = await AsyncStorage.getItem('userToken');
            if (!userId) {
                alert('Usuário não autenticado.');
                return;
            }

            const response = await axios.get(`${BASE_URL}/reports`);
            const filteredReports = response.data.filter((report: Report) => report.user?.userId === userId);
            setReports(filteredReports);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
        }
    };


    const saveDeviceAnalysis = async () => {
        try {
            const userId = await AsyncStorage.getItem('userToken');
            if (!userId) {
                alert('Usuário não autenticado.');
                return;
            }

            if (deviceAnalysis.length === 0) {
                alert('Nenhuma análise de dispositivo para salvar.');
                return;
            }

            const analysisData = {
                device: { deviceId: deviceAnalysis[0].device.deviceId },
                deviceCurrentWatts: deviceAnalysis[0].deviceCurrentWatts,
                energyUsageMonthly: deviceAnalysis[0].energyUsageMonthly,
                efficiencyClass: deviceAnalysis[0].efficiencyClass,
                user: { userId }
            };

            console.log('Dados de análise que serão enviados:', analysisData);
            const response = await axios.post(`${BASE_URL}/device-analysis`, analysisData);

            console.log('Resposta da API ao salvar a análise:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erro ao salvar a análise de dispositivos:', error);
            throw error;
        }
    };

    const generateReportForSelectedDevice = async () => {
        if (!selectedDeviceId) {
            alert('Selecione um dispositivo para gerar o relatório.');
            return;
        }

        try {
            const savedDeviceAnalysis = await saveDeviceAnalysis();
            if (!savedDeviceAnalysis || !savedDeviceAnalysis.deviceAnalysisId) {
                alert('Falha ao salvar a análise do dispositivo.');
                return;
            }

            const userId = await AsyncStorage.getItem('userToken');
            if (!userId) {
                alert('Usuário não autenticado.');
                return;
            }

            const reportData: Report = {
                deviceAnalysis: {
                    deviceAnalysisId: savedDeviceAnalysis.deviceAnalysisId,
                },
                generatedAt: new Date().toISOString(),
                user: { userId }
            };

            console.log('Dados do relatório que serão enviados:', reportData);

            const response = await axios.post(`${BASE_URL}/reports`, reportData);

            setReports([...reports, { ...reportData, reportId: response.data.id }]);
            alert('Relatório gerado e salvo com sucesso!');
            await loadReportsFromAPI();
            await generateMockDataAndAnalysis();
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
        }
    };

    const handleDeleteReport = async (reportId?: number) => {
        Alert.alert(
            "Excluir Relatório",
            "Você tem certeza que deseja excluir este relatório e a análise associada?",
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
                            const reportToDelete = reports.find(report => report.reportId === reportId);

                            await axios.delete(`${BASE_URL}/reports/${reportId}`);

                            if (reportToDelete && reportToDelete.deviceAnalysis) {
                                const { deviceAnalysisId } = reportToDelete.deviceAnalysis;
                                await axios.delete(`${BASE_URL}/device-analysis/${deviceAnalysisId}`);
                            }
                            const filteredReports = reports.filter(report => report.reportId !== reportId);
                            setReports(filteredReports);

                            alert('Relatório excluído com sucesso!');
                        } catch (error) {
                            console.error('Erro ao excluir relatório e análise:', error);
                            alert('Erro ao excluir o relatório e sua análise associada. Tente novamente.');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleViewReport = (report: Report) => {
        if (!report || !report.deviceAnalysis) {
            alert('Dados incompletos no relatório selecionado.');
            return;
        }
        console.log('Visualizando relatório:', report);
        setSelectedReport(report);
        setIsModalVisible(true);
    };

    const renderReportItem = ({ item }: { item: Report }) => {
        if (!item || !item.deviceAnalysis) {
            return null;
        }
        return (
            <View style={styles.reportItem}>
                <Text style={styles.reportTitle}>
                    Relatório gerado em: {new Date(item.generatedAt).toLocaleString()}
                </Text>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity onPress={() => handleViewReport(item)}>
                        <Text style={styles.viewButton}>Visualizar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteReport(item.reportId)}>
                        <Text style={styles.deleteButton}>Excluir Relatório</Text>
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
            <Text style={styles.title}>Geração de Relatórios</Text>
            <CustomPicker
                selectedValue={selectedDeviceId}
                onValueChange={setSelectedDeviceId}
                options={devices.map(device => ({
                    label: `${device.deviceName} - ${device.deviceType}`,
                    value: device.deviceId.toString()
                }))}
                placeholder="Selecione um dispositivo"
            />
            <Button title="Gerar Relatório" onPress={generateReportForSelectedDevice} />
            <Text style={styles.subTitle}>Relatórios Gerados</Text>
            <FlatList
                data={reports}
                renderItem={renderReportItem}
                keyExtractor={item => (item && item.reportId ? item.reportId.toString() : Math.random().toString())}
                style={styles.reportList}
            />

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>Detalhes do Relatório</Text>
                            {selectedReport && (
                                <View style={styles.deviceItem}>
                                    <Text style={styles.deviceName}>Dispositivo Analisado:</Text>
                                    <Text>Nome do Dispositivo: {selectedReport.deviceAnalysis?.device?.deviceName || 'Nome não disponível'}</Text>
                                    <Text>Tipo do Dispositivo: {selectedReport.deviceAnalysis?.device?.deviceType || 'Tipo não disponível'}</Text>
                                    <Text>Tempo Estimado de Uso: {selectedReport.deviceAnalysis?.device?.estimatedUsageHours || 'Horas não disponíveis'} horas</Text>
                                    <Text>Potência Registrada: {selectedReport.deviceAnalysis?.deviceCurrentWatts || 'Potência não disponível'} watts</Text>
                                    <Text>Consumo Mensal Estimado: {selectedReport.deviceAnalysis?.energyUsageMonthly || 'Consumo não disponível'} kWh</Text>
                                    <Text>Classificação de Eficiência: {selectedReport.deviceAnalysis?.efficiencyClass || 'Classificação não disponível'}</Text>
                                </View>
                            )}
                            <Button title="Fechar" onPress={() => setIsModalVisible(false)} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    subTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 8,
    },
    reportList: {
        marginTop: 16,
    },
    reportItem: {
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        marginVertical: 8,
        padding: 16,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    viewButton: {
        color: '#1E90FF',
        fontWeight: 'bold',
    },
    deleteButton: {
        color: '#D11A2A',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
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

export default ReportGeneration;