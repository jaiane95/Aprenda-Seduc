# APRENDA+ — Educação Inclusiva & Gamificada 🌟

O **APRENDA+** é um aplicativo escolar feito para ajudar no aprendizado de crianças de forma amigável, especialmente aquelas com **Autismo (TEA)** e **TDAH**. Ele mistura a organização de uma rotina diária com a diversão de jogos (gamificação), ajudando o aluno a aprender brincando e a se organizar sozinho.

---

##  A Proposta

O principal objetivo é criar um espaço na internet simples e acolhedor para todo mundo na escola:
* **Para Alunos:** Menos ansiedade com uma agenda visual bem simples e tarefas coloridas que dão moedas virtuais. Com essas moedas, você pode comprar itens e roupinhas na loja para o seu próprio bonequinho (avatar)!
* **Para Professores:** Acompanhar as respostas dos alunos na hora, criar novas atividades e ver relatórios bem explicados sobre como os alunos estão indo.
* **Para Gestores:** Cadastrar e organizar os professores, definir as turmas e monitorar o andamento geral da escola.

---

## 🎨 Funcionalidades Principais

### 1. Área do Aluno (Estude Jogando!)
* **Rotina Visual:** Uma lista de tarefas com cartões coloridos para a criança saber o que vai fazer no dia (evitando preocupação e surpresas).
* **Atividades Divertidas:** Desafios rápidos de Português, Matemática e Ciências com balões de comemoração ao acertar.
* **Loja de Avatares:** Cada acerto dá moedas! Use suas moedas para comprar itens e deixar o seu bonequinho com a sua cara.
* **Dar Nome ao Boneco:** Você pode dar um nome personalizado para o seu bonequinho de estimação.
* **Botão de Ajuda:** Se o aluno estiver com dúvidas ou chateado, ele pode clicar em um botão para avisar o professor na hora.

### 2. Painel do Professor (Acompanhamento)
* **Cadastro de Alunos:** Criar, editar e excluir contas de alunos com facilidade, definindo uma senha numérica (PIN) simples de 4 dígitos.
* **Criação de Atividades:** Adicionar novas perguntas nas matérias.
* **Central de Chamados:** Ver na hora quais alunos pediram ajuda na sala.
* **Relatório de Desempenho:** Gráficos simples que mostram os acertos do aluno por matéria, o histórico de humor (como ele tem se sentido) e os itens comprados na loja.

### 3. Painel do Gestor (Administração)
* **Cadastrar Professores:** Criar contas para os professores com senhas (PINs) exclusivas.
* **Ver Turmas e Alunos:** Acompanhar quais turmas e matérias cada professor está cuidando.

---

## 🛠️ Tecnologias Usadas

O aplicativo foi criado para ser rápido, seguro e muito bonito de usar.

* **Interface Visual:** Feita com **React** e **TypeScript** para que as telas carreguem bem rápido e sem erros.
* **Estilização:** Usa **Tailwind CSS** para criar cores suaves que não cansam a vista das crianças.
* **Animações:** Usa a biblioteca **motion** para criar efeitos visuais divertidos, como moedas voando e transições suaves de tela.
* **Banco de Dados:** Usa **Firebase / Firestore** para salvar na nuvem e atualizar as informações em tempo real (como os pedidos de ajuda e notas).
* **Salvamento Local:** Usa **Zustand** para salvar as moedas e o bonequinho do aluno direto no navegador, assim o progresso não é perdido se a página atualizar.

---

## 🚀 Como o App foi Desenvolvido

O APRENDA+ foi criado com a ajuda de inteligências artificiais avançadas:
1. **Google AI Studio:** Ajudou a criar perguntas interessantes e a pensar em rotinas saudáveis recomendadas para crianças autistas e com TDAH.
2. **Agente Antigravity:** Ajudou a escrever os códigos das telas, corrigir erros visuais e garantir que a loja de itens e os logs estivessem funcionando sem falhas.

---

## 📦 Como Executar o Projeto Localmente

### Pré-requisitos
Antes de começar, você precisa ter instalado em seu computador:
* [Git](https://git-scm.com) (programa para baixar códigos do GitHub).
* [Node.js](https://nodejs.org) (programa necessário para rodar o aplicativo).

### Passo a Passo para Rodar
1. Abra o terminal na pasta do projeto e instale os pacotes necessários digitando:
   ```bash
   npm install
   ```

2. Inicie o aplicativo com o comando:
   ```bash
   npm run dev
   ```

3. Abra o seu navegador de internet e entre no link padrão:
   * [http://localhost:3000](http://localhost:3000)
