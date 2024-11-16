import React, { useState } from 'react';
import { View, Modal, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface EditMeterModalProps {
    isVisible: boolean;
    meterName: string;
    onSave: (name: string) => void;
    onClose: () => void;
}

const EditMeterModal: React.FC<EditMeterModalProps> = ({ isVisible, meterName, onSave, onClose }) => {
    const [name, setName] = useState(meterName);

    const handleSave = () => {
        onSave(name);
    };

    return (
        <Modal transparent={true} visible={isVisible} animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Editar Medidor</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nome do Medidor"
                        value={name}
                        onChangeText={setName}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={handleSave}>
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 16,
        padding: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    buttonText: {
        color: '#1E3E69',
        fontWeight: 'bold',
    },
});

export default EditMeterModal;
