import { StyleSheet, Text, View, TextInput, Button, Image, Alert } from "react-native";
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Sent() {
  const [email, setEmail] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senha, setSenha] = useState('');

  // Função para buscar a senha do usuário
  const buscarSenha = async () => {
    try {
      const clinicasJson = await AsyncStorage.getItem('clinicas');
      if (clinicasJson) {
        const clinicas = JSON.parse(clinicasJson);
        const clinica = clinicas.find((c: { email: string; }) => c.email === email);
        
        if (clinica) {
          setSenha(clinica.senha);
          setMostrarSenha(true);
        } else {
          Alert.alert('Erro', 'E-mail não encontrado');
        }
      }
    } catch (erro) {
      console.error('Erro ao buscar senha:', erro);
      Alert.alert('Erro', 'Não foi possível recuperar a senha');
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
      <Text style={styles.texto}>Insira seu e-mail para receber as instruções</Text>
      <Button
        title="Recuperar Senha"
        onPress={buscarSenha}
      />
      {mostrarSenha && (
        <View style={styles.senhaContainer}>
          <Text style={styles.senhaTexto}>Sua senha: {senha}</Text>
          <Button
            title="Esconder Senha"
            onPress={() => setMostrarSenha(false)}
            color="#ff4444"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: "#000",
  },
  input: {
    width: '80%',
    height: 40,
    borderBottomColor: '#000',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  texto: {
    fontSize: 15,
    color: "#000",
    marginBottom: 20,
  },
  senhaContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  senhaTexto: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  }
});