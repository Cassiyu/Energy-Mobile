import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../api/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { SignUpNavigationProp } from '../types/navigation';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://energy-davinci.azurewebsites.net';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigation = useNavigation<SignUpNavigationProp>();

  const saveUserData = async (userId: string, email: string) => {
    try {
      const response = await axios.post(`${BASE_URL}/users`, {
        userId: userId,
        email: email,
        createdAt: new Date().toISOString()
      });
      console.log("Dados do usuário salvos na API com sucesso:", response.data);
    } catch (error) {

      if (axios.isAxiosError(error) && error.response) {
        console.error("Erro na resposta da API:", error.response.data);
      } else {
        const err = error as any;
        console.error("Erro ao salvar dados do usuário na API:", err.message);
      }
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não correspondem.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      await AsyncStorage.setItem('userToken', userId);
      await AsyncStorage.setItem('lastUserEmail', email);

      saveUserData(userId, email);

      console.log('Cadastro bem-sucedido!');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      navigation.navigate('Menu');
    } catch (err: any) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Este email já está em uso.');
          break;
        case 'auth/invalid-email':
          setError('Por favor, insira um email válido.');
          break;
        case 'auth/weak-password':
          setError('A senha deve ter pelo menos 6 caracteres.');
          break;
        default:
          setError('Erro ao criar conta. Tente novamente.');
      }
    }
  };

  return (
    <View style={styles.view}>
      <Logo />
      <Input
        placeText="Email"
        value={email}
        onChangeText={setEmail}
      />

      <Input
        placeText="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Input
        placeText="Confirme a Senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button
        title="Cadastrar"
        onPress={handleSignUp}
      />

      <Text
        style={styles.text}
        onPress={() => navigation.navigate('Login')}
      >
        Já está cadastrado? Entre
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
    padding: 16
  },
  text: {
    marginTop: 8,
    textAlign: 'center',
    color: '#1E3E69',
    fontWeight: '600'
  },
  errorText: {
    marginTop: 8,
    color: 'red',
    textAlign: 'center'
  }
});

export default SignUp;
