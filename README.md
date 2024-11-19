<div align="center">
   <h2> DaVinci Energy </h2>
</div>

<h3> Integrantes </h3>

- RM550341 - Allef Santos (2TDSPV)
- RM551491 - Cassio Yuji Hirassike Sakai
- RM97836 - Debora Damasso Lopes
- RM550323 - Paulo Barbosa Neto
- RM552314 - Yasmin Araujo Santos Lopes

---------------------------------------------------

## Projeto

DaVinci Energy é uma solução projetada para residências e pequenos comércios com o objetivo de monitorar, controlar e otimizar o consumo de energia elétrica. Usando dispositivos de medição de consumo e inteligência de dados, a plataforma fornece informações detalhadas sobre o uso de energia de cada dispositivo. Com base nas classificações de eficiência energética do Inmetro, ela orienta os usuários na escolha de dispositivos mais eficientes e no uso consciente e econômico de energia.

---------------------------------------------------

## Aplicativo

### Funcionalidades Gerais
- **Autenticação**: Os usuários podem fazer login ou se registrar usando Firebase Authentication.
- **CRUD de Dispositivos e Medidores**: Permite registrar, atualizar, visualizar e excluir dispositivos e medidores de energia.
- **Análises de Consumo e Relatórios**: Processa dados de consumo para fornecer análises detalhadas e relatórios.
- **Integração com Banco de Dados da Azure**: A API é configurada para se conectar e interagir com o banco de dados hospedado na Azure.
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

