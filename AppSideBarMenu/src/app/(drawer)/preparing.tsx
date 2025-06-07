import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator, Keyboard } from "react-native";
import React, { useState } from 'react'; 
import { Link, useRouter } from 'expo-router';
import { auth } from './firebaseConfig'; 
import { signInWithEmailAndPassword } from 'firebase/auth'; 

export default function Preparing() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const [processandoLogin, setProcessandoLogin] = useState(false);

  const handleLoginFirebase = async () => {
    if (!email || !senha) {
      setErro('Por favor, preencha o email e a senha.');
      return;
    }
    Keyboard.dismiss();
    setProcessandoLogin(true);
    setErro('');

    try {
     
      await signInWithEmailAndPassword(auth, email, senha);
      
      router.replace('/delivered');

    } catch (error: any) {
      let errorMessage = 'Ocorreu um erro ao tentar fazer login.';
      if (error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'O formato do email é inválido.';
      }
      setErro(errorMessage);
    } finally {
     
      setProcessandoLogin(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/logo.png')} 
        style={styles.logo}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry={true}
        autoComplete="password"
      />

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <TouchableOpacity
        style={styles.botaoContainer}
        onPress={handleLoginFirebase}
        disabled={processandoLogin} 
      >
        {processandoLogin ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Logar</Text>
        )}
      </TouchableOpacity>

      <Link href="/cadastro" asChild>
        <TouchableOpacity style={styles.botaoLink}>
          <Text style={styles.textoLink}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/sent" asChild>
        <TouchableOpacity style={styles.botaoLink}>
          <Text style={styles.textoLinkVermelho}>Esqueceu a senha?</Text>
        </TouchableOpacity>
      </Link>
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
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  botaoContainer: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 50,
    justifyContent: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botaoLink: {
    marginTop: 15,
    paddingVertical: 8,
  },
  textoLink: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
  },
  textoLinkVermelho: {
    color: "red",
    fontSize: 15,
    fontWeight: '500',
  },
  erro: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
    width: '90%',
  }
});