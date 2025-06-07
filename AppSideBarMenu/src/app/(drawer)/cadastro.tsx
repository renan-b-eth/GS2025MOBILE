import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from './firebaseConfig'; 
// ALTERADO: Importar a função de login também
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';

export interface CadastroFormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha?: string; 
}

export default function Cadastro() { 
  const router = useRouter();
  
  // NOVO: Estado para controlar se a tela está em modo de Login ou Cadastro
  const [isLoginMode, setIsLoginMode] = useState(false);

  const [dados, setDados] = useState<CadastroFormData>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState(false);

  const validarDados = (): boolean => {
    if (!dados.nome.trim() || !dados.email.trim() || !dados.senha.trim() || !dados.confirmarSenha?.trim()) {
      setErro('Por favor, preencha todos os campos.');
      return false;
    }
    if (dados.senha !== dados.confirmarSenha) {
      setErro('As senhas não coincidem.');
      return false;
    }
    if (dados.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dados.email)) {
        setErro('Por favor, insira um email válido.');
        return false;
    }
    setErro('');
    return true;
  };

  const handleCadastroFirebase = async () => {
    if (!validarDados()) return;

    Keyboard.dismiss();
    setCarregando(true);
    setErro('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
      const user = userCredential.user;
      if (user) {
        await updateProfile(user, { displayName: dados.nome });
      }

      Alert.alert(
        "Cadastro Realizado!",
        "Sua conta foi criada. Agora faça o login para continuar.",
      );
      
      // --- AQUI ESTÁ A CORREÇÃO PRINCIPAL ---
      // Em vez de navegar para outra tela, apenas mudamos o modo para Login.
      setIsLoginMode(true);
      // Limpamos os campos para o usuário não precisar apagar
      setDados({ nome: '', email: dados.email, senha: '', confirmarSenha: '' });

    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErro('Este email já está cadastrado. Tente fazer login.');
      } else {
        setErro('Ocorreu um erro ao tentar criar a conta.');
      }
    } finally {
      setCarregando(false);
    }
  };

  // NOVO: Função para o Login
  const handleLoginFirebase = async () => {
    if (!dados.email.trim() || !dados.senha.trim()) {
        setErro('Por favor, preencha email e senha.');
        return;
    }
    Keyboard.dismiss();
    setCarregando(true);
    setErro('');
    try {
        await signInWithEmailAndPassword(auth, dados.email, dados.senha);
        // Se o login der certo, vai para a tela de abrigos
        router.replace('/delivered');
    } catch (error: any) {
        setErro('Email ou senha inválidos.');
    } finally {
        setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* O título muda de acordo com o modo */}
      <Text style={styles.title}>{isLoginMode ? 'Fazer Login' : 'Criar Nova Conta'}</Text>
      
      <Image
        source={require('../../../assets/images/logo.png')} 
        style={styles.logo}
      />

      {/* Campo de Nome só aparece no modo de Cadastro */}
      {!isLoginMode && (
        <TextInput
            style={styles.input}
            placeholder="Nome Completo"
            value={dados.nome}
            onChangeText={(text) => setDados({ ...dados, nome: text })}
            autoCapitalize="words"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={dados.email}
        onChangeText={(text) => setDados({ ...dados, email: text.trim() })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={dados.senha}
        onChangeText={(text) => setDados({ ...dados, senha: text })}
        secureTextEntry={true}
      />

      {/* Campo de Confirmar Senha só aparece no modo de Cadastro */}
      {!isLoginMode && (
        <TextInput
            style={styles.input}
            placeholder="Confirmar Senha"
            value={dados.confirmarSenha}
            onChangeText={(text) => setDados({ ...dados, confirmarSenha: text })}
            secureTextEntry={true}
        />
      )}

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <TouchableOpacity
        style={styles.botaoContainer}
        // A função chamada depende do modo (Login ou Cadastro)
        onPress={isLoginMode ? handleLoginFirebase : handleCadastroFirebase}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          // O texto do botão muda
          <Text style={styles.textoBotao}>{isLoginMode ? 'Entrar' : 'Cadastrar'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoLink}
        // Este botão agora apenas troca o modo da tela
        onPress={() => {
            setIsLoginMode(!isLoginMode);
            setErro('');
        }}
      >
        <Text style={styles.textoLink}>
            {isLoginMode ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Seus estilos originais sem alteração
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logo: {
    width: 120,
    height: 120, 
    resizeMode: 'contain',
    marginBottom: 25,
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
    backgroundColor: '#f9f9f9'
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1, 
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  erro: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
    width: '90%',
    fontSize: 14,
  },
  botaoLink: {
    marginTop: 20,
    paddingVertical: 8,
  },
  textoLink: {
     color: '#007AFF',
     fontSize: 15,
     fontWeight: '500',
  },
});