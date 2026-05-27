# APRENDA+ — Educação Inclusiva & Gamificada 🌟

O **APRENDA+** é uma aplicação educacional de suporte à inclusão, especialmente projetada para crianças com **Transtorno do Espectro Autista (TEA)** e **Transtorno do Déficit de Atenção com Hiperatividade (TDAH)**. A ferramenta une a previsibilidade de uma rotina estruturada com o reforço positivo da gamificação para incentivar a autonomia e o aprendizado de forma lúdica.

---

## 💡 A Proposta

O principal objetivo do projeto é oferecer um ambiente digital acessível e acolhedor que facilite o dia a dia pedagógico:
* **Para Alunos:** Redução da ansiedade através de uma agenda visual clara e incentivo ao estudo por meio de atividades gamificadas que rendem recompensas virtuais (moedas para personalizar o próprio avatar).
* **Para Professores:** Acompanhamento do progresso em tempo real, controle de questionários e visualização de alertas e relatórios de desempenho detalhados.
* **Para Gestores:** Gestão do corpo docente, definição de acessos e monitoramento geral das turmas e disciplinas da escola.

---

## 🎨 Funcionalidades Principais

### 1. Área do Aluno (Experiência Gamificada)
*   **Rotina Visual Interativa:** Agenda estruturada em cartões visuais para dar previsibilidade às tarefas diárias da criança (reduzindo ansiedade e organizando o dia).
*   **Atividades Pedagógicas Multidisciplinares:** Questionários dinâmicos de português, matemática e ciências, gerando reforço positivo imediato.
*   **Gamificação & Loja de Avatares:** Os acertos nas atividades concedem créditos (moedas). O aluno pode gastar esses créditos na loja para adquirir itens e personalizar seu próprio boneco.
*   **Nomeação do Boneco:** Opção direta e acolhedora para que o estudante dê um nome personalizado ao seu companheiro virtual de jornada.
*   **Botão de Ajuda / Alerta:** Canal direto onde a criança pode sinalizar que está com dúvidas ou em crise, notificando a tela do professor.

### 2. Painel do Professor (Gestão & Acompanhamento)
*   **Gerenciamento de Alunos:** Criação, edição de dados e exclusão de contas de estudantes com geração de PIN de segurança numérico exclusivo de 4 dígitos.
*   **Gerenciamento de Classes e Conteúdos:** Criação e customização de atividades curriculares.
*   **Central de Alertas em Tempo Real:** Monitor de notificações para ver os chamados de socorro ou dúvidas emitidos pelos alunos em sala.
*   **Relatórios de Desempenho e Logs:** Painel de progresso detalhado por aluno (taxa de acerto global, acertos por disciplina, histórico de compras de avatares e linha do tempo de humor diário).

### 3. Painel do Gestor (Administração Escolar)
*   **Gerenciamento do Corpo Docente:** Cadastro de professores com definição de nome e PIN de segurança de 4 dígitos personalizados.
*   **Supervisão de Turmas e Disciplinas:** Visualização dinâmica dos alunos e disciplinas sob a coordenação de cada professor cadastrado.

---


## 🛠️ Tecnologias Base do Projeto

A stack do **APRENDA+** foi selecionada visando reatividade rápida, segurança de dados em tempo real e fluidez na execução das animações pedagógicas.

### 💻 Frontend (Interface)
*   **React + TypeScript (Vite):** Utiliza componentes funcionais estruturados e estritamente tipados para evitar erros em execução e proporcionar alta velocidade de carregamento.
*   **Tailwind CSS:** Toda a interface utiliza as classes utilitárias do Tailwind para construir o tema customizado com tons amigáveis, reduzindo fadiga cognitiva e estresse sensorial.
*   **motion (Framer Motion):** Aplicado no fluxo de transição de telas, interações com a rotina e conquistas de moedas, tornando o aplicativo vivo e recompensador.
*   **Lucide React:** Uma coleção coesa de ícones lineares de fácil reconhecimento visual.

### 🗄️ Estado e Sincronização (Banco de Dados & Sync)
*   **Zustand (com Persistência Ativa):** Gerenciador de estado global robusto configurado com persistência sincronizada no `localStorage` do navegador (`aprendaplus-storage-v2`). Isso garante que, mesmo apagando ou recarregando o app, dados cruciais como a configuração do robô/boneco, itens já adquiridos e moedas remanescentes continuem preservados localmente para o aluno.
*   **Firebase / Cloud Firestore:** Banco de dados NoSQL utilizado para persistir e propagar em tempo real as coleções de usuários, notificações de ajuda e rotinas personalizadas ao painel professor-aluno.
*   **Regras de Segurança Integradas:** Políticas flexíveis de acesso no arquivo `firestore.rules` customizadas para permitir sincronizações simplificadas de relatórios e de progresso multidispositivos em sala de aula sem fricções.

---

## 🚀 Desenvolvimento Eficiente e Progressivo

O desenvolvimento do APRENDA+ seguiu uma metodologia de **construção progressiva e evolutiva** usando ferramentas de inteligência artificial de ponta:

1.  **Google AI Studio:** Utilizado para conceber a lógica pedagógica inclusiva, criar questionários adequados e projetar heurísticas baseadas em boas práticas médicas e pedagógicas para crianças com TEA e TDAH.
2.  **Agente Antigravity:** Atuou como copiloto técnico principal, refinando iterativamente cada componente, tratando os dados do Firestore com tolerância a erros através de middlewares, resolvendo problemas de linting estático e garantindo que cada atualização do banco estivesse alinhada com as compras de itens da loja e com a identidade visual dos avatares integrados.

---

## 📦 Como Executar o Projeto Localmente

### Pré-requisitos
Antes de começar, você precisa ter instalado em sua máquina:
* [Git](https://git-scm.com) (ferramenta de controle de versão).
* [Node.js](https://nodejs.org) (ambiente de execução JavaScript).

### Instruções para Rodar o App
1. Instale as dependências executando no seu terminal:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento local:
   ```bash
   npm run dev
   ```

3. Acesse a aplicação no seu navegador através do link padrão:
   * [http://localhost:3000](http://localhost:3000)
