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
import { auth } from '../firebaseConfig'; // Importe sua configuração do Firebase
import { createUserWithEmailAndPassword, updateProfile, User } from 'firebase/auth';

// Interface para os dados do formulário de cadastro
export interface CadastroFormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha?: string; // Adicionado para confirmação de senha
}

export default function CadastroScreen() { // Renomeado para clareza
  const router = useRouter();
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
    // Validação básica de email (pode ser mais robusta)
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
      //Criar o usuário com email e senha no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
      const user = userCredential.user;

      //Atualizar o perfil do usuário com o nome (displayName)
      if (user) {
        await updateProfile(user, {
          displayName: dados.nome,
        });
        console.log('Perfil do usuário atualizado com o nome:', dados.nome);
      }

      Alert.alert(
        "Cadastro Realizado!",
        "Sua conta foi criada com sucesso. Você será redirecionado.",
        [{ text: "OK" }]
      );
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/preparing'); // Rota da sua tela de login
      }

    } catch (error: any) {
      console.error('[DEBUG] Erro detalhado no cadastro:', error);
      if (error.code === 'auth/email-already-in-use') {
        setErro('Este email já está cadastrado. Tente fazer login.');
      } else if (error.code === 'auth/invalid-email') {
        setErro('O formato do email é inválido.');
      } else if (error.code === 'auth/weak-password') {
        setErro('A senha é muito fraca. Tente uma senha mais forte.');
      } else {
        setErro('Ocorreu um erro ao tentar criar a conta. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Nova Conta</Text>
      <Image
        source={require('../assets/logo.png')} // Certifique-se que o caminho para o logo está correto
        style={styles.logo}
      />

      <TextInput
        style={[styles.input, erro.includes('nome') || erro.includes('todos') ? styles.inputError : {}]}
        placeholder="Nome Completo"
        value={dados.nome}
        onChangeText={(text) => setDados({ ...dados, nome: text })}
        autoCapitalize="words"
      />

      <TextInput
        style={[styles.input, erro.includes('email') || erro.includes('todos') ? styles.inputError : {}]}
        placeholder="Email"
        value={dados.email}
        onChangeText={(text) => setDados({ ...dados, email: text.trim() })}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <TextInput
        style={[styles.input, erro.includes('senha') || erro.includes('coincidem') || erro.includes('todos') ? styles.inputError : {}]}
        placeholder="Senha (mínimo 6 caracteres)"
        value={dados.senha}
        onChangeText={(text) => setDados({ ...dados, senha: text })}
        secureTextEntry={true}
        autoComplete="new-password"
      />

      <TextInput
        style={[styles.input, erro.includes('coincidem') || erro.includes('todos') ? styles.inputError : {}]}
        placeholder="Confirmar Senha"
        value={dados.confirmarSenha}
        onChangeText={(text) => setDados({ ...dados, confirmarSenha: text })}
        secureTextEntry={true}
        autoComplete="new-password"
      />

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <TouchableOpacity
        style={styles.botaoContainer}
        onPress={handleCadastroFirebase}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Cadastrar</Text>
        )}
      </TouchableOpacity>

       <TouchableOpacity
          style={styles.botaoLink}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/login')} // Volta para login
        >
          <Text style={styles.textoLink}>Já tem uma conta? Faça Login</Text>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logo: {
    width: 120, // Ajustado
    height: 120, // Ajustado
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
    borderWidth: 1, // Garante que a borda vermelha seja visível
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