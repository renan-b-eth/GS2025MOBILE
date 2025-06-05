
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, Keyboard } from "react-native";
import React, { useState } from 'react';
import { useRouter } from 'expo-router'; 
import { auth } from './firebaseConfig'; 
import { sendPasswordResetEmail } from 'firebase/auth';

export default function Sent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleRecuperarSenha = async () => {
    if (!email.trim()) {
      setErro('Por favor, insira seu endereço de email.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setErro('Por favor, insira um email válido.');
        return false;
    }

    Keyboard.dismiss();
    setCarregando(true);
    setErro('');
    setMensagemSucesso('');

    if (!auth) {
        console.error("RecuperarSenhaScreen: ERRO CRÍTICO - Instância 'auth' do Firebase não está disponível.");
        setErro("Erro na configuração. Não é possível enviar o email.");
        setCarregando(false);
        return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMensagemSucesso(`Um email de redefinição de senha foi enviado para ${email}, caso esta conta exista. Verifique sua caixa de entrada e spam.`);
      Alert.alert(
        "Email Enviado",
        `Se ${email} estiver registrado, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada e spam.`
      );
      
    } catch (error: any) {
      console.error("Erro ao enviar email de redefinição de senha:", error.code, error.message);
      if (error.code === 'auth/user-not-found') {
        
        setMensagemSucesso(`Se ${email} estiver registrado, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada e spam.`);
      } else if (error.code === 'auth/invalid-email') {
        setErro('O formato do email fornecido é inválido.');
      } else if (error.code === 'auth/network-request-failed') {
        setErro('Falha na rede. Verifique sua conexão e tente novamente.');
      }
      else {
        setErro('Ocorreu um erro ao tentar enviar o email de redefinição. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/logo.png')} 
        style={styles.logo}
      />
      <Text style={styles.title}>Recuperar Senha</Text>
      <Text style={styles.instructions}>
        Digite seu email abaixo. Se ele estiver associado a uma conta, enviaremos um link para você redefinir sua senha.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Seu Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
      {mensagemSucesso ? <Text style={styles.sucesso}>{mensagemSucesso}</Text> : null}

      <TouchableOpacity
        style={styles.botaoContainer}
        onPress={handleRecuperarSenha}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Enviar Email de Redefinição</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoLink}
        onPress={() => router.canGoBack() ? router.back() : router.replace('/delivered')} 
      >
        <Text style={styles.textoLink}>Voltar para o Login</Text>
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
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: "#333",
    marginBottom: 15,
  },
  instructions: {
    fontSize: 15,
    color: "#555",
    textAlign: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  botaoContainer: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
    elevation: 2,
    marginBottom: 15,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  erro: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
    width: '90%',
    fontSize: 14,
  },
  sucesso: {
    color: 'green',
    marginBottom: 15,
    textAlign: 'center',
    width: '90%',
    fontSize: 14,
  },
  botaoLink: {
    marginTop: 10,
    paddingVertical: 8,
  },
  textoLink: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
  },
});
