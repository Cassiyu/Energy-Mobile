import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ref, set, get, remove } from "firebase/database";
import { database, auth } from '../api/firebaseConfig';
import Button from '../components/Button';
import IconLeft from '../components/IconLeft';
import LogoText from '../components/LogoText';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamsList } from '../types/navigation';
import classifyDeviceEfficiency from '../mock/efficiencyClassification';

interface DeviceAnalysis {
    device_name: string;
    device_type: string;
    device_current_watts: number;
    estimated_usage_hours: string;
    energy_usage_monthly: number;
    efficiency_class: string;
}

interface Report {
    id: string;
    generated_at: string;
    devices_analysis: DeviceAnalysis[];
}

const ReportGeneration = () => {
    const [devicesAnalysis, setDevicesAnalysis] = useState<DeviceAnalysis[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
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

        const loadReportsFromFirebase = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    console.error('Usuário não autenticado');
                    return;
                }

                const reportRef = ref(database, `users/${userId}/reports`);
                const snapshot = await get(reportRef);

                if (snapshot.exists()) {
                    const reportsFromDB = snapshot.val();
                    const reportArray = Object.keys(reportsFromDB).map((key) => ({
                        id: key,
                        ...reportsFromDB[key],
                    }));
                    setReports(reportArray);
                }
            } catch (error) {
                console.error('Erro ao carregar relatórios:', error);
            }
        };

        loadDevicesFromFirebase();
        loadReportsFromFirebase();
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
            const usageInHours = parseFloat(data.estimated_usage_hours.split(' ')[0]);
            const dailyUsage = data.device_current_watts * usageInHours / 1000;
            const monthlyUsage = dailyUsage * 30;

            let efficiencyClass = classifyDeviceEfficiency(data.device_type, monthlyUsage);

            return {
                device_name: data.device_name,
                device_type: data.device_type,
                device_current_watts: data.device_current_watts,
                estimated_usage_hours: data.estimated_usage_hours,
                energy_usage_monthly: Number(monthlyUsage.toFixed(2)),
                efficiency_class: efficiencyClass,
            };
        });
    };

    const generateReport = async () => {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
                throw new Error('Usuário não autenticado');
            }

            const reportData = {
                generated_at: new Date().toISOString(),
                devices_analysis: devicesAnalysis,
            };

            const reportRef = ref(database, `users/${userId}/reports/${new Date().getTime()}`);
            await set(reportRef, reportData);

            setReports([...reports, { id: new Date().getTime().toString(), ...reportData }]);
            alert('Relatório gerado e salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
        }
    };

    const handleDeleteReport = async (reportId: string) => {
        Alert.alert(
            "Excluir Relatório",
            "Você tem certeza que deseja excluir este relatório?",
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

                            const reportRef = ref(database, `users/${userId}/reports/${reportId}`);
                            await remove(reportRef);

                            const filteredReports = reports.filter((report) => report.id !== reportId);
                            setReports(filteredReports);
                            alert('Relatório excluído com sucesso!');
                        } catch (error) {
                            console.error('Erro ao excluir relatório:', error);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleViewReport = (report: Report) => {
        setSelectedReport(report);
        setIsModalVisible(true);
    };

    const renderReportItem = ({ item }: { item: Report }) => (
        <View style={styles.reportItem}>
            <Text style={styles.reportTitle}>Relatório gerado em: {new Date(item.generated_at).toLocaleString()}</Text>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={() => handleViewReport(item)}>
                    <Text style={styles.viewButton}>Visualizar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteReport(item.id)}>
                    <Text style={styles.deleteButton}>Excluir Relatório</Text>
                </TouchableOpacity>
            </View>
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
            <Text style={styles.title}>Geração de Relatórios</Text>
            <Button title="Gerar Relatório" onPress={generateReport} />
            <Text style={styles.subTitle}>Relatórios Gerados</Text>
            <FlatList
                data={reports}
                renderItem={renderReportItem}
                keyExtractor={(item) => item.id}
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
                            {selectedReport?.devices_analysis.map((device, index) => (
                                <View key={index} style={styles.deviceItem}>
                                    <Text style={styles.deviceName}>Dispositivo: {device.device_name}</Text>
                                    <Text>Tipo: {device.device_type}</Text>
                                    <Text>Potência Registrada: {device.device_current_watts} watts</Text>
                                    <Text>Tempo Estimado de Uso: {device.estimated_usage_hours}</Text>
                                    <Text>Consumo Mensal Estimado: {device.energy_usage_monthly} kWh</Text>
                                    <Text>Classificação de Eficiência: {device.efficiency_class}</Text>
                                </View>
                            ))}
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

