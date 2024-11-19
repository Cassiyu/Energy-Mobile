import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Button from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamsList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IconLogout from '../components/IconLogout';
import LogoText from '../components/LogoText';

const Menu = () => {
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const navigation = useNavigation<StackNavigationProp<RootStackParamsList>>();

    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                const email = await AsyncStorage.getItem('lastUserEmail');

                if (!userToken) {
                    navigation.navigate('Login');
                } else {
                    setUserEmail(email || '');
                }
            } catch (err) {
                console.error('Erro ao carregar o usuário:', err);
            }
        };

        checkUserSession();
    }, []);

    const handleNavigateToDevices = () => {
        navigation.navigate('RegisterDevice');
    };

    const handleNavigateToMeters = () => {
        navigation.navigate('RegisterMeter');
    };

    const handleNavigateToEfficiencyAnalysis = () => {
        navigation.navigate('EfficiencyAnalysis');
    };

    const handleNavigateToReportGeneration = () => {
        navigation.navigate('ReportGeneration');
    };

    const handleLogout = () => {
        Alert.alert(
            "Sair",
            "Você tem certeza que deseja sair?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sair", onPress: async () => {
                        await AsyncStorage.removeItem('userToken');
                        await AsyncStorage.removeItem('lastUserEmail');
                        navigation.navigate('Login');
                    }
                }
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconLogoutContainer}>
                    <IconLogout onPress={handleLogout} />
                </View>
                <View style={styles.logoContainer}>
                    <LogoText />
                </View>
            </View>

            <View>
                <Text style={styles.title}>Menu</Text>

                {userEmail ? (
                    <Text style={styles.userEmail}>{`Usuário: ${userEmail}`}</Text>
                ) : null}

                <Button title="Medidores" onPress={handleNavigateToMeters} />
                <Button title="Dispositivos" onPress={handleNavigateToDevices} />
                <Button title="Eficiência" onPress={handleNavigateToEfficiencyAnalysis} />
                <Button title="Relatório" onPress={handleNavigateToReportGeneration} />
            </View>
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
    iconRightContainer: {
        position: 'absolute',
        right: 0,
    },
    iconLogoutContainer: {
        position: 'absolute',
        left: 0,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    userEmail: {
        textAlign: 'center',
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 8,
    },

});

export default Menu;
