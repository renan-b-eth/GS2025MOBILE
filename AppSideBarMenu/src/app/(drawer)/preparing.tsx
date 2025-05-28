// app/login.tsx (ou mantenha Preparing.tsx se preferir, mas ajuste as rotas)
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator, Keyboard } from "react-native";
import React, { useState, useEffect } from 'react';
import { Link, useRouter } from 'expo-router';
import { auth } from '../firebaseConfig'; // Importe a configuração do Firebase
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';

export default function Preparing() { 
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true); // Para verificar o estado de auth inicial

  // Observador do estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        console.log("Usuário logado, redirecionando:", user.email);
        router.replace('/delivered'); 
      } else {
        // Usuário está deslogado
        console.log("Nenhum usuário logado.");
        setCarregando(false);
      }
    });

    return () => unsubscribe();
  }, [router]); 

  const handleLoginFirebase = async () => {
    if (!email || !senha) {
      setErro('Por favor, preencha o email e a senha.');
      return;
    }
    Keyboard.dismiss(); 
    setCarregando(true);
    setErro(''); 

    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (error: any) {
      console.error("Erro no login com Firebase:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErro('Email ou senha incorretos.');
      } else if (error.code === 'auth/invalid-email') {
        setErro('O formato do email é inválido.');
      } else {
        setErro('Ocorreu um erro ao tentar fazer login. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <View style={[styles.container, styles.containerCarregando]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.carregandoTexto}>Verificando sessão...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')} 
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
        disabled={carregando} 
      >
        {carregando && !erro ? ( 
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

      <Link href="/recuperarSenha" asChild>
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
  containerCarregando: {
     justifyContent: 'center',
  },
  carregandoTexto: {
     marginTop: 10,
     fontSize: 16,
     color: '#555',
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
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 3,
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