
import AsyncStorage from '@react-native-async-storage/async-storage';


interface Clinica {
  id: string;
  nome: string;
  email: string;
  senha: string;
  responsavel: string;
}

interface AutenticacaoResponse {
  token: string;
  clinica: Clinica;
}

interface ErroAutenticacao {
  codigo: number;
  mensagem: string;
  detalhes?: string;
}

export const autenticacaoService = {
  async cadastrar(nome: string, email: string, senha: string, responsavel: string) {
    try {
      
      const id = Date.now().toString();
      
      
      const clinica: Clinica = {
        id,
        nome,
        email,
        senha,
        responsavel
      };

      
      await AsyncStorage.setItem('clinicas', JSON.stringify([clinica]));
      
    
      const token = `token-${id}`;
      
      return {
        token,
        clinica
      };
    } catch (error) {
      throw {
        codigo: 500,
        mensagem: 'Erro ao cadastrar clínica',
        detalhes: String(error)
      };
    }
  },

  async login(email: string, senha: string) {
    try {
     
      const clinicasJson = await AsyncStorage.getItem('clinicas');
      const clinicas = clinicasJson ? JSON.parse(clinicasJson) : [];

     
      const clinica = clinicas.find((c: { email: string; senha: string; }) => c.email === email && c.senha === senha);

      if (!clinica) {
        throw {
          codigo: 401,
          mensagem: 'Email ou senha incorretos',
          detalhes: 'Verifique suas credenciais'
        };
      }

     
      const token = `token-${clinica.id}`;

      return {
        token,
        clinica
      };
    } catch (error) {
      throw {
        codigo: 500,
        mensagem: 'Erro no login',
        detalhes: String(error)
      };
    }
  }
};