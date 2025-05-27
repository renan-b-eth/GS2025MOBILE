import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  TelaPrincipal: undefined;
};

export type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export type LoginScreenProps = {
  navigation: LoginScreenNavigationProp;
};
export interface ErroAutenticacao {
  codigo: number;
  mensagem: string;
  detalhes?: string;
}