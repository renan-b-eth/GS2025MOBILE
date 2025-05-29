// app/login.tsx (ou Preparing.tsx, ajuste o nome e o caminho de importação abaixo)
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator, Keyboard } from "react-native";
import React, { useState, useEffect } from 'react';
import { Link, useRouter } from 'expo-router';
// ATENÇÃO: Verifique este caminho. Se Preparing.tsx está em 'app/' e firebaseConfig.tsx na raiz, use '../firebaseConfig'
import { auth } from './firebaseConfig'; // Importe a configuração do Firebase
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';

export default function Preparing() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  // Estado para o carregamento inicial da verificação de sessão
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  // Estado para o carregamento durante o processo de login via botão
  const [processandoLogin, setProcessandoLogin] = useState(false);

  // Observador do estado de autenticação
  useEffect(() => {
    if (!auth) {
      console.error("LoginScreen: ERRO CRÍTICO - Instância 'auth' do Firebase não está disponível. Verifique firebaseConfig.ts e sua importação.");
      setErro("Erro na configuração. Contate o suporte.");
      setVerificandoSessao(false); // Para de verificar se auth não existe
      return;
    }

    console.log("LoginScreen: useEffect onAuthStateChanged montado.");
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        console.log("LoginScreen: Usuário Firebase logado (detectado por onAuthStateChanged):", user.email);
        // Apenas redireciona se não estivermos já no meio de um processo de login manual
        // que ainda não terminou (embora após sucesso, este callback deve ser rápido)
        // e se a verificação inicial da sessão estiver concluída.
        setVerificandoSessao(false); // Garante que paramos de verificar a sessão
        router.replace('/delivered'); // Rota para sua tela principal após login
      } else {
        console.log("LoginScreen: Nenhum usuário Firebase logado (detectado por onAuthStateChanged).");
        setVerificandoSessao(false); // Permite que a UI de login seja mostrada
      }
    });

    // Limpa o observador quando o componente é desmontado
    return () => {
      console.log("LoginScreen: useEffect onAuthStateChanged desmontado.");
      unsubscribe();
    };
  }, [router]); // router como dependência

  const handleLoginFirebase = async () => {
    if (!auth) {
        setErro("Erro de configuração. Não é possível fazer login.");
        return;
    }
    if (!email || !senha) {
      setErro('Por favor, preencha o email e a senha.');
      return;
    }
    Keyboard.dismiss();
    setProcessandoLogin(true); // Inicia o carregamento para o processo de login
    setErro('');

    console.log("LoginScreen: Tentando login com Email:", email);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      // Sucesso! O onAuthStateChanged acima vai pegar a mudança de estado do usuário
      // e fazer o redirecionamento. Não precisamos mudar 'processandoLogin' para false aqui,
      // pois o componente deve ser desmontado.
      console.log("LoginScreen: signInWithEmailAndPassword bem-sucedido para:", email);
    } catch (error: any) {
      console.error("LoginScreen: Erro no login com Firebase:", error.code, error.message);
      let errorMessage = 'Ocorreu um erro ao tentar fazer login. Tente novamente.';
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/invalid-credential') {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'O formato do email é inválido.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Falha na rede. Verifique sua conexão e tente novamente.';
      }
      setErro(errorMessage);
      setProcessandoLogin(false); // Define como false APENAS em caso de erro no login
    }
  };

  // Mostra o loader grande apenas durante a verificação inicial da sessão
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
        source={require('../../../assets/images/logo.png')} // ATENÇÃO: Verifique este caminho para o logo
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
        disabled={processandoLogin} // Desabilita o botão enquanto o login está sendo processado
      >
        {processandoLogin ? ( // Mostra ActivityIndicator se processandoLogin for true
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
