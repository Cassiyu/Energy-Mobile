import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { v4 as uuidv4 } from 'uuid';
import { ref, set, get, remove } from "firebase/database";
import { auth, database } from '../api/firebaseConfig';
import IconLeft from '../components/IconLeft';
import LogoText from '../components/LogoText';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamsList } from '../types/navigation';
import EditMeterModal from '../components/EditMeterModal';

interface EnergyMeter {
    meter_id: string;
    meter_name: string;
}

const RegisterMeter = () => {
    const [meterName, setMeterName] = useState('');
    const [energyMeters, setEnergyMeters] = useState<EnergyMeter[]>([]);
    const [editingMeterId, setEditingMeterId] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMeterName, setModalMeterName] = useState('');

    const navigation = useNavigation<StackNavigationProp<RootStackParamsList>>();

    useEffect(() => {
        const loadEnergyMetersFromFirebase = async () => {
            try {
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    throw new Error("Usuário não autenticado");
                }
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

        loadEnergyMetersFromFirebase();
    }, []);

    const handleAddEnergyMeter = async () => {
        if (meterName) {
            const newMeter: EnergyMeter = {
                meter_id: uuidv4(),
                meter_name: meterName,
            };

            try {
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    throw new Error("Usuário não autenticado");
                }

                const meterRef = ref(database, `users/${userId}/energy_meters/${newMeter.meter_id}`);
                await set(meterRef, newMeter);

                setEnergyMeters([...energyMeters, newMeter]);
                setMeterName('');
            } catch (error) {
                console.error("Erro ao salvar medidor de energia no Firebase:", error);
            }
        } else {
            alert('Por favor, insira o nome do medidor.');
        }
    };

    const handleEditMeter = (meter: EnergyMeter) => {
        setModalMeterName(meter.meter_name);
        setEditingMeterId(meter.meter_id);
        setIsModalVisible(true);
    };

    const handleSaveModal = async (name: string) => {
        if (editingMeterId) {
            const updatedMeter: EnergyMeter = {
                meter_id: editingMeterId,
                meter_name: name,
            };

            try {
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    throw new Error("Usuário não autenticado");
                }

                const meterRef = ref(database, `users/${userId}/energy_meters/${editingMeterId}`);
                await set(meterRef, updatedMeter);

                const updatedMeters = energyMeters.map((meter) =>
                    meter.meter_id === editingMeterId ? updatedMeter : meter
                );
                setEnergyMeters(updatedMeters);
                setEditingMeterId(null);
                setIsModalVisible(false);
            } catch (error) {
                console.error("Erro ao atualizar medidor de energia no Firebase:", error);
            }
        }
    };

    const handleDeleteMeter = async (meterId: string) => {
        Alert.alert(
            "Excluir Medidor",
            "Você tem certeza que deseja excluir este medidor?",
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

                            const meterRef = ref(database, `users/${userId}/energy_meters/${meterId}`);
                            await remove(meterRef);

                            const filteredMeters = energyMeters.filter((meter) => meter.meter_id !== meterId);
                            setEnergyMeters(filteredMeters);

                            const devicesRef = ref(database, `users/${userId}/devices`);
                            const devicesSnapshot = await get(devicesRef);

                            if (devicesSnapshot.exists()) {
                                const devices = devicesSnapshot.val();

                                for (const deviceId in devices) {
                                    if (devices[deviceId].energy_meter_id === meterId) {
                                        await set(ref(database, `users/${userId}/devices/${deviceId}/energy_meter_id`), "");
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Erro ao excluir medidor de energia no Firebase:", error);
                        }
                    },
                },
            ],
            { cancelable: false }
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
            <Text style={styles.title}>Cadastro de Medidores de Energia</Text>
            <Input placeText="Nome do Medidor" value={meterName} onChangeText={setMeterName} />
            <Button title="Adicionar Medidor" onPress={handleAddEnergyMeter} />

            <FlatList
                data={energyMeters}
                renderItem={({ item }) => (
                    <View style={styles.meterItem}>
                        <Text style={styles.meterName}>{item.meter_name}</Text>
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity onPress={() => handleEditMeter(item)}>
                                <Text style={styles.buttonText}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteMeter(item.meter_id)}>
                                <Text style={styles.buttonText}>Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                keyExtractor={(item) => item.meter_id}
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
