<div align="center">
   <h2> DaVinci Energy </h2>
</div>

<h3> Integrantes </h3>

- RM550341 - Allef Santos (2TDSPV)
- RM551491 - Cassio Yuji Hirassike Sakai
- RM97836 - Debora Damasso Lopes
- RM550323 - Paulo Barbosa Neto
- RM552314 - Yasmin Araujo Santos Lopes

## Projeto

DaVinci Energy é uma solução desenvolvida para residências e pequenos comércios, com foco no monitoramento e otimização do consumo de energia elétrica. Utilizando medidores de consumo, a plataforma oferece dados detalhados sobre o uso energético de cada dispositivo. Com base em classificações de eficiência energética, a plataforma ajuda os usuários a identificar possíveis falhas ou desgastes nos aparelhos, promovendo manutenção preventiva ou substituição quando necessário. Dessa forma, a DaVinci Energy contribui para a redução de desperdícios energéticos, maior eficiência no consumo e economia sustentável de energia.

## Aplicativo

### Funcionalidades Gerais
- **Autenticação**: Os usuários podem fazer login ou se registrar usando Firebase Authentication.
- **Integração com Banco de Dados da Azure**: A API é configurada para se conectar e interagir com o banco de dados hospedado na Azure.
- **CRUD de Dispositivos e Medidores**: Permite registrar, atualizar, visualizar e excluir dispositivos e medidores de energia.
- **Análises de Consumo e Relatórios**: Processa dados de consumo para fornecer análises detalhadas e relatórios.
- **AsyncStorage**: Armazena localmente tokens de autenticação, permitindo salvar a sessão do usuário.

### Integração com a API Java Spring Boot
O DaVinci Energy integra-se com uma API construída em Java Spring Boot, para gerenciar os dados de dispositivos, medidores de energia, análises de consumo e relatórios. Esta API utiliza um banco de dados relacional na Azure para armazenamento seguro e eficiente dos dados.

### Estrutura das Telas:
#### Login:
- Permite que os usuários façam login no aplicativo usando Firebase Authentication.
- Campos de entrada para email e senha.
- Botão para redirecionar para a tela de cadastro (SignUp) se o usuário ainda não tiver uma conta.

#### SignUp

- Tela para registrar novos usuários, também utilizando Firebase Authentication.
- Campos para inserir email, senha e confirmação de senha.
- Botão para criar uma nova conta e redirecionar para a tela de cadastro (Loign) se o usuário já tiver uma conta.

#### Menu:

- Tela principal que serve como ponto de navegação para as outras funcionalidades do aplicativo.
- Exibe opções para acessar o registro de medidores e dispositivos, análise de eficiência e geração de relatórios.

#### RegisterMeter:

- Tela onde os usuários podem registrar medidores de energia.
- Formulário para adicionar detalhes sobre o medidor, como nome do medidor.
- Botão para salvar o medidor.

#### EfficiencyAnalysis:

- Tela para exibir a análise de eficiência energética dos dispositivos registrados.
- Calculo de eficiência de cada tipo dispositivo com base no consumo de energia.
- Classificação dos dispositivos com base em critérios de eficiência energética.
- Possibilidade de filtrar análises por dispositivo.

#### ReportGeneration:

- Tela para geração de relatórios de consumo de energia e classficação de eficiência de um dispositivo selecionado.
- Os usuários podem excluir os relatórios gerados.

## Passos para Rodar
   
1. **Clonar o Repositório do Projeto Mobile**:
   ```bash
   git clone https://github.com/Cassiyu/Energy-Mobile.git
   ```
   ```bash
   cd Energy-Mobile
   ```

2. **Instalar Dependências**:
   ```bash
   npm install
   ```

3. **Configurar o Firebase Authentication**:
   No arquivo `firebaseConfig.ts` configure a string de conexão para o Firebase Authentication.
   ```javascript
   {
      apiKey: "sua-chave-api",
      authDomain: "seu-projeto.firebaseapp.com",
      databaseURL: "https://seu-projeto.firebaseio.com",
      projectId: "seu-projeto-id",
      storageBucket: "seu-projeto.appspot.com",
      messagingSenderId: "seu-messaging-id",
      appId: "seu-app-id"
   }
   ```

4. **Rodar o Projeto**:
   Inicie o Expo para rodar o projeto no emulador ou dispositivo físico.
   ```bash
   npm start
   ```
