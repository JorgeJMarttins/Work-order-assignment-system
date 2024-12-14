
# Sistema de Programação de Ordens de Serviço - DaRoça

## Descrição
Este projeto visa desenvolver um sistema para a empresa fictícia DaRoça, que melhora a comunicação e o gerenciamento entre os funcionários e os mecânicos. A solução busca otimizar o fluxo de trabalho e melhorar a eficiência operacional, tornando as informações sobre ordens de serviço mais acessíveis e organizadas.

## Tecnologias Utilizadas
- **Node.js**: Ambiente de execução para JavaScript no lado do servidor.
- **Express**: Framework minimalista para criar o servidor e as rotas da API.
- **MSSQL**: Banco de dados SQL Server utilizado para armazenar as ordens de serviço e programações.
- **dotenv**: Carregamento das variáveis de ambiente do arquivo `.env` para configuração segura.
- **CORS**: Permite a comunicação entre o servidor e diferentes origens de recursos.
- **Fetch API**: Utilizada para fazer requisições externas (busca de dados de ordens de serviço e mecânicos).

## Funcionalidades
- **Alocação de Ordens de Serviço**: As ordens de serviço são automaticamente atribuídas aos mecânicos com base na disponibilidade de tempo, considerando um limite de 8 horas de trabalho por dia.
- **Pausa para os Mecânicos**: Os mecânicos devem fazer uma pausa de 1 hora após trabalhar entre 3 e 5 horas. Isso é gerenciado automaticamente pelo sistema.
- **Rotas**:
  - `GET /programacao`: Retorna todas as programações armazenadas no banco de dados.
  - `POST /programacao`: Gera a programação das ordens de serviço para os mecânicos, distribuindo as ordens de acordo com sua carga horária e a disponibilidade dos mecânicos.
  - `DELETE /programacao/:codigoCentroDistribuicao`: Exclui a programação de ordens de serviço de um centro de distribuição específico.

## Estrutura do Código

O código implementa a API que faz a alocação automática de ordens de serviço para os mecânicos, garantindo que o limite de 8 horas de trabalho por dia seja respeitado e que pausas de 1 hora sejam feitas quando necessário (após 3 a 5 horas de trabalho contínuo). Aqui estão os principais componentes do código:

1. **Conexão com o Banco de Dados**:
   - Utiliza a biblioteca `mssql` para realizar a conexão com um banco de dados SQL Server.
   - A função `conectaBD()` gerencia a conexão e a função `execQuery(querySql)` executa as consultas SQL.

2. **Funções de Lógica de Programação**:
   - A função `converteTempoParaMinutos(tempo)` converte o tempo das ordens de serviço de formato "HH:MM" para minutos, facilitando o controle da carga horária.
   - A função principal da alocação de ordens é executada na rota `POST /programacao`. Ela distribui as ordens de acordo com a disponibilidade dos mecânicos e respeita a carga horária limite de 8 horas por dia.

3. **Rotas**:
   - A rota `DELETE /programacao/:codigoCentroDistribuicao` exclui as programações de ordens de serviço de um centro de distribuição específico.
   - A rota `POST /programacao` realiza a alocação das ordens de serviço e verifica a disponibilidade dos mecânicos.
   - A rota `GET /programacao` retorna todas as programações armazenadas.

## Instruções de Instalação

1. Clone o repositório:

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env` com as credenciais do banco de dados:
   ```
   PORT=3000
   CONNECTION_STRING=seu_banco_de_dados_conexao_string
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```

5. O servidor estará rodando em `http://localhost:3000`.

## Como Funciona a Alocação das Ordens de Serviço

- **Limite de Horas**: O sistema aloca as ordens de serviço aos mecânicos de forma que nenhum mecânico ultrapasse 8 horas de trabalho por dia.
- **Pausas**: Quando um mecânico trabalha entre 3 e 5 horas, uma pausa de 1 hora é programada automaticamente.
- **Horário de Funcionamento**: As ordens de serviço são alocadas dentro do horário de expediente, das 08:15 às 18:00. Se a ordem não puder ser concluída dentro desse horário, ela é transferida para o próximo dia.
