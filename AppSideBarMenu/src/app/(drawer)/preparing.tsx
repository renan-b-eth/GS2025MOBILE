import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import { autenticacaoService } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Preparing() {
  const router = useRouter();
  const CREDENCIAIS_VALIDAS = {
    email: 'adm@adm.com',
    senha: 'adm'
  };

  const [erro, setErro] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const verificarLogin = () => {
    if (email === CREDENCIAIS_VALIDAS.email && senha === CREDENCIAIS_VALIDAS.senha) {
      router.push('/delivered');
    } else {
      setErro('Email ou senha incorretos');
    }
  };

  useEffect(() => {
    const verificarTokenExistente = async () => {
      const tokenSalvo = await AsyncStorage.getItem('token');
      if (tokenSalvo) {
        router.push('/delivered');
      }
    };
    verificarTokenExistente();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await autenticacaoService.login(email, senha);
      await AsyncStorage.setItem('token', response.token);
      router.push('/delivered');
    } catch (error) {
      setErro('Email ou senha incorretos');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./logo.png')}
        style={{
          width: 200,
          height: 200,
          resizeMode: 'contain'
        }}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry={true}
      />
      <TouchableOpacity
        style={styles.botaoContainer}
        onPress={handleLogin}
      >
        <Text style={{ color: '#fff' }}>Logar</Text>
      </TouchableOpacity>
      <Link href="/cadastro" style={styles.botaoContainer}>
        <Text style={{ color: '#fff' }}>Cadastro</Text>
      </Link>
      <TouchableOpacity
    style={styles.container}
    onPress={() => router.navigate('/sent')}
>
    <Text style={styles.title2}>Recuperar Senha</Text>
    {erro && <Text style={styles.erro}>{erro}</Text>}
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: "#000",
    marginTop: 20
  },
  title2: {
    fontSize: 15,
    fontWeight: 'bold',
    color: "red",
    paddingVertical: 2,
    marginTop: 20
  },
  input: {
    width: '80%',
    height: 40,
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 15
  },
  botaoContainer: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 3,
    color: '#fff',
    marginBottom: 10
  },
  erro: {
    color: 'red',
    marginTop: 10
  }
});