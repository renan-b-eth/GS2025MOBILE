import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator, Keyboard } from "react-native";
import React, { useState, useEffect, useRef } from 'react'; 
import { Link, useRouter } from 'expo-router';
import { auth } from './firebaseConfig'; 
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';

export default function Preparing() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [processandoLogin, setProcessandoLogin] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true; 
    return () => {
      isMounted.current = false; 
      console.log("LoginScreen: useEffect principal desmontado.");
    };
  }, []);

  useEffect(() => {
    if (!auth) {
      console.error("LoginScreen: ERRO CRÍTICO - Instância 'auth' do Firebase não está disponível.");
      if (isMounted.current) {
        setErro("Erro na configuração do Firebase. Contate o suporte.");
        setVerificandoSessao(false);
      }
      return;
    }

    console.log("LoginScreen: Configurando onAuthStateChanged.");
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!isMounted.current) return; 

      console.log("LoginScreen: onAuthStateChanged disparado. Usuário:", user ? user.email : null);
      if (user) {
        console.log("LoginScreen: Usuário detectado, redirecionando para /delivered.");
        setVerificandoSessao(false); 
        setProcessandoLogin(false); 
        router.replace('/delivered');
      } else {
        console.log("LoginScreen: Nenhum usuário detectado.");
        setVerificandoSessao(false);
        
      }
    });

    return () => {
      console.log("LoginScreen: Desinscrevendo onAuthStateChanged.");
      unsubscribe();
    };
  }, [router]); 

  const handleLoginFirebase = async () => {
    if (!isMounted.current) return;
    if (!auth) {
      setErro("Erro de configuração. Não é possível fazer login.");
      return;
    }
    if (!email || !senha) {
      setErro('Por favor, preencha o email e a senha.');
      return;
    }
    Keyboard.dismiss();
    setProcessandoLogin(true);
    setErro('');

    console.log("LoginScreen: Tentando login com Email:", email);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      console.log("LoginScreen: signInWithEmailAndPassword bem-sucedido para:", email);
     
    } catch (error: any) {
      console.error("LoginScreen: Erro no login com Firebase:", error.code, error.message);
      let errorMessage = 'Ocorreu um erro ao tentar fazer login.';
      if (error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'O formato do email é inválido.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Falha na rede. Verifique sua conexão e tente novamente.';
      }
      
      if (isMounted.current) {
        setErro(errorMessage);
        setProcessandoLogin(false);
      }
    }
  };

  if (verificandoSessao) {
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
        disabled={processandoLogin || verificandoSessao} 
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