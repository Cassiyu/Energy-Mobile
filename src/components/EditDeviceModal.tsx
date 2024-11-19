import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Input from './Input';
import CustomPicker from './CustomPicker';

interface EditDeviceModalProps {
    isVisible: boolean;
    deviceName: string;
    deviceType: string;
    estimatedUsageHours: string;
    selectedMeter: number | string;
    timeUnit: 'Horas' | 'Minutos';
    onMeterChange: (selectedMeter: number | string) => void;
    onClose: () => void;
    onSave: (deviceName: string, deviceType: string, estimatedUsageHours: string, timeUnit: 'Horas' | 'Minutos', selectedMeter: string) => void;
    energyMeters: { energyMeterId: number; meterName: string }[];
}

const EditDeviceModal: React.FC<EditDeviceModalProps> = ({
    isVisible,
    deviceName,
    deviceType,
    selectedMeter,
    energyMeters,
    estimatedUsageHours,
    timeUnit,
    onClose,
    onSave,
}) => {
    const [localDeviceName, setLocalDeviceName] = useState(deviceName);
    const [localDeviceType, setLocalDeviceType] = useState(deviceType);
    const [localSelectedMeter, setLocalSelectedMeter] = useState(selectedMeter);

    const [localEstimatedUsageHours, setLocalEstimatedUsageHours] = useState(estimatedUsageHours);
    const [localTimeUnit, setLocalTimeUnit] = useState<'Horas' | 'Minutos'>(timeUnit);

    useEffect(() => {
        setLocalDeviceName(deviceName);
        setLocalDeviceType(deviceType);
        setLocalEstimatedUsageHours(estimatedUsageHours);
        setLocalSelectedMeter(selectedMeter);
        setLocalTimeUnit(timeUnit);
    }, [deviceName, deviceType, estimatedUsageHours, selectedMeter, timeUnit]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Editar Dispositivo</Text>
                    <CustomPicker
                        selectedValue={String(localSelectedMeter ?? '')}
                        onValueChange={(value: string) => setLocalSelectedMeter(Number(value))}
                        options={energyMeters.map(meter => ({ label: meter.meterName, value: String(meter.energyMeterId) }))}
                        placeholder="Selecione um Medidor"
                    />
                    <Input
                        placeText="Nome do Dispositivo"
                        value={localDeviceName}
                        onChangeText={setLocalDeviceName}
                    />
                    <CustomPicker
                        selectedValue={localDeviceType}
                        onValueChange={(itemValue: string) => setLocalDeviceType(itemValue)}
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
                                selectedValue={localTimeUnit}
                                onValueChange={(itemValue: string) => setLocalTimeUnit(itemValue as 'Horas' | 'Minutos')}
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
                                value={localEstimatedUsageHours}
                                onChangeText={setLocalEstimatedUsageHours}
                                style={styles.input}
                            />
                        </View>
                    </View>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            onPress={() => onSave(localDeviceName, localDeviceType, localEstimatedUsageHours, localTimeUnit, String(localSelectedMeter))}>
                            <Text style={styles.buttonText}>Salvar</Text>
                        </TouchableOpacity>


                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        elevation: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
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
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    buttonText: {
        color: '#1E3E69',
        fontWeight: 'bold',
    },
});

export default EditDeviceModal;
