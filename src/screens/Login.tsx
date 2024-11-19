import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../api/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { LoginNavigationProp } from '../types/navigation';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigation = useNavigation<LoginNavigationProp>();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          navigation.navigate('Menu');
        }
      } catch (err) {
        console.error('Erro ao verificar sessão', err);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha o email e a senha.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = userCredential.user.uid;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('lastUserEmail', email);

      console.log('Login bem-sucedido!');
      setError('');
      navigation.navigate('Menu');
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
          setError('Usuário não encontrado.');
          break;
        case 'auth/wrong-password':
          setError('Senha incorreta.');
          break;
        default:
          setError('Erro ao fazer login.');
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

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button
        title="Login"
        onPress={handleLogin}
      />

      <Text
        style={styles.text}
        onPress={() => navigation.navigate('SignUp')}
      >
        Novo por aqui? Crie uma conta
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
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

export default Login;