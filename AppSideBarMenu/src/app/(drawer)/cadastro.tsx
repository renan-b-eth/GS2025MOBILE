// Cadastro.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { Link, router, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { autenticacaoService } from './api';

// Interfaces e tipos
export interface CadastroDados {
  nome: string;
  email: string;
  senha: string;
  responsavel: string;
}

// Constantes
const TIMEOUT_REQUEST = 10000; // 10 segundos
const TOKEN_EXPIRATION = 30 * 60 * 1000; // 30 minutos

// Cadastro.tsx
export default function Cadastro() {
  const [dados, setDados] = useState<CadastroDados>({
    nome: '',
    email: '',
    senha: '',
    responsavel: ''
  });
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState(false);

  const validarDados = (dados: CadastroDados): boolean => {
    if (!dados.nome || !dados.email || !dados.senha || !dados.responsavel) {
      setErro('Por favor, preencha todos os campos');
      return false;
    }
    return true;
  };

  const handleCadastro = useCallback(async () => {
    if (!validarDados(dados)) return;

    setCarregando(true);
    setErro('');

    try {
      const id = Date.now().toString();
      
      const clinica = {
        id,
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        responsavel: dados.responsavel
      };

      // Primeiro, vamos verificar se já existe alguma clínica
      const clinicasJson = await AsyncStorage.getItem('clinicas');
      let clinicas = clinicasJson ? JSON.parse(clinicasJson) : [];

      // Verificar se o email já está cadastrado
      const emailExiste = clinicas.some((c: { email: string; }) => c.email === clinica.email);
      if (emailExiste) {
        throw {
          codigo: 400,
          mensagem: 'Email já cadastrado',
          detalhes: 'Este email já está sendo usado por outra clínica'
        };
      }

      // Adicionar nova clínica à lista
      clinicas.push(clinica);

      // Salvar no AsyncStorage
      await AsyncStorage.setItem('clinicas', JSON.stringify(clinicas));

      // Gerar token
      const token = `token-${id}`;
      await AsyncStorage.setItem('token', token);
      
      router.back();
    } catch (error) {
      console.error('[DEBUG] Erro detalhado:', error);
      if (error instanceof Error) {
        setErro('Erro no cadastro');
      } else {
        setErro('Erro no cadastro. Verifique os logs para mais detalhes.');
      }
    } finally {
      setCarregando(false);
    }
  }, [dados, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro de Clínica</Text>
      <Image
        source={require('./logo.png')}
        style={styles.logo}
      />
      
      <TextInput
        style={[styles.input, erro ? styles.inputError : {}]}
        placeholder="Nome"
        value={dados.nome}
        onChangeText={(text) => setDados({...dados, nome: text})}
      />
      
      <TextInput
        style={[styles.input, erro ? styles.inputError : {}]}
        placeholder="Email"
        value={dados.email}
        onChangeText={(text) => setDados({...dados, email: text})}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={[styles.input, erro ? styles.inputError : {}]}
        placeholder="Senha"
        value={dados.senha}
        onChangeText={(text) => setDados({...dados, senha: text})}
        secureTextEntry={true}
      />
      
      <TextInput
        style={[styles.input, erro ? styles.inputError : {}]}
        placeholder="Responsável"
        value={dados.responsavel}
        onChangeText={(text) => setDados({...dados, responsavel: text})}
      />
      
      {erro && (
        <Text style={styles.erro}>{erro}</Text>
      )}
      
      <TouchableOpacity
        style={styles.botaoContainer}
        onPress={handleCadastro}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff' }}>Cadastrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20
  },
  input: {
    width: '100%',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  inputError: {
    borderBottomColor: 'red'
  },
  botaoContainer: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center'
  },
  erro: {
    color: 'red',
    marginBottom: 15,
    marginTop: 10
  }
});