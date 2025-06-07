# App de Gerenciamento de Abrigos

### Projeto para a Global Solution - FIAP

## 👥 Desenvolvedores

Este projeto foi desenvolvido com dedicação pela seguinte equipe:

| Nome Completo                     | RM       |
| --------------------------------- | -------- |
| **Glenda Delfy Vela Mamani** | 552667   |
| **Lucas Alcântara Carvalho** | 95111    |
| **Renan Bezerra dos Santos** | 553228   |

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Um aplicativo móvel, multiplataforma, desenvolvido com React Native e Expo. Esta aplicação foi criada para oferecer uma solução integrada para a gestão de abrigos de emergência, conectando-se a uma API para fornecer dados em tempo real e permitindo a autenticação segura de usuários com Firebase.

## 🎥 Vídeo de Demonstração

Assista a uma demonstração completa das funcionalidades da nossa aplicação no YouTube.

**[Clique aqui para assistir ao vídeo de demonstração](https://youtu.be/uC0C7vRTC-E)**

## 🌟 Principais Funcionalidades

O projeto oferece uma experiência de usuário completa, dividida em várias telas e funcionalidades:

#### 🔐 Autenticação Segura com Firebase
- **Fluxo Completo:** Telas de Login e Cadastro que se comunicam com o Firebase Authentication.
- **Gerenciamento de Sessão:** O usuário permanece logado e é redirecionado automaticamente ao abrir o app.
- **Logout Seguro:** Permite que o usuário encerre sua sessão e retorne à tela de login.

#### 🏠 Gestão e Visualização de Abrigos
- **Consumo de API REST:** O app busca e exibe uma lista de abrigos a partir de uma API externa.
- **Atualização em Tempo Real:** Os dados são atualizados automaticamente a cada 10 segundos, refletindo o estado mais recente dos abrigos.
- **Funcionalidade de Check-in:** Permite registrar a entrada de pessoas nos abrigos, enviando uma requisição `PUT` para a API e atualizando a ocupação.

#### 📊 Dashboard de Lotação
- **Visualização Intuitiva:** Apresenta barras de progresso que mostram a lotação de cada abrigo (vagas ocupadas vs. capacidade total).
- **Tomada de Decisão Rápida:** Ajuda os gestores e usuários a identificar rapidamente quais abrigos ainda possuem vagas disponíveis.

#### 🗺️ Mapa e Geolocalização
- **Tela de Boas-vindas:** Mostra a localização atual do usuário em um mapa interativo ao entrar no aplicativo.
- **Navegação Intuitiva:** A partir do mapa, o usuário pode navegar para a lista de abrigos disponíveis.

## 🛠️ Tecnologias e Bibliotecas

Este projeto foi construído utilizando as seguintes tecnologias e bibliotecas:

- **React Native (com Expo):** Para a construção de toda a interface e lógica do aplicativo móvel.
- **TypeScript:** Para adicionar tipagem estática e robustez ao código JavaScript.
- **Firebase (Authentication):** Para o sistema de autenticação de usuários (Login, Cadastro, Logout).
- **Axios:** Para realizar as requisições HTTP à API de abrigos de forma eficiente.
- **Expo Router:** Para o gerenciamento de rotas e navegação entre as telas do aplicativo.
- **React Native Maps:** Para a incorporação do mapa interativo na tela inicial.
- **Expo Location:** Para obter a geolocalização do dispositivo do usuário.

## 🚀 Instalação e Execução

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos
- [Node.js](https://nodejs.org/en/) (versão LTS)
- [Git](https://git-scm.com/)
- Um dispositivo móvel com o app **Expo Go** instalado.

### Passos


1.  **Instale as dependências:**
    ```bash
    npm install
    npm install expo-cli
    ```
2.  **Instale as bibliotecas nativas do Expo:**
    ```bash
    npx expo install react-native-maps
    npx expo install expo-location
    ```

## 🌐 Documentação da API

O aplicativo se conecta a uma API REST para gerenciar os dados dos abrigos.

**URL Base:** `https://abrigoapi95111.azurewebsites.net/api`

### Endpoints de Abrigos

| Método | Endpoint        | Descrição                     |
| :----- | :-------------- | :---------------------------- |
| `GET`  | `/abrigos`      | Lista todos os abrigos.       |
| `GET`  | `/abrigos/{id}` | Detalhes de um abrigo.        |
| `POST` | `/abrigos`      | Cria um novo abrigo.          |
| `PUT`  | `/abrigos/{id}` | Atualiza um abrigo.           |
| `DELETE`| `/abrigos/{id}`| Remove um abrigo.             |

### Exemplo de Corpo da Requisição (POST / PUT)

```json
{
  "nome": "Abrigo Central",
  "endereco": "Rua das Árvores, 100",
  "regiao": "Centro",
  "temperatura": 27,
  "recursos": "água,comida,medicamentos",
  "capacidade": 50,
  "ocupacao": 10,
  "ativo": true,
  "responsavel": "Maria Souza",
  "telefone": "(11) 91234-5678"
}
