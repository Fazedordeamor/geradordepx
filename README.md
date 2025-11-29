# Deploy na Netlify via GitHub com Sincronização Dyad

Este guia explica como configurar o deploy contínuo deste projeto na Netlify usando um repositório GitHub, permitindo que a IA Dyad sincronize as alterações diretamente.

### Pré-requisitos

- Uma conta no [GitHub](https://github.com).
- Uma conta na [Netlify](https://www.netlify.com).
- Este projeto de código em um repositório GitHub.

---

### Passo 1: Fazer Push do Código para o GitHub

Se você ainda não fez isso, envie seu código para um repositório GitHub.

1.  Crie um novo repositório no GitHub.
2.  No terminal, na pasta do seu projeto, execute os seguintes comandos:

    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
    git push -u origin main
    ```

---

### Passo 2: Conectar o Reposório à Netlify

1.  Faça login na sua conta Netlify.
2.  Clique em **"Add new site"** e selecione **"Import an existing project"**.
3.  Escolha **"GitHub"** como provedor Git e autorize a Netlify a acessar seus repositórios.
4.  Selecione o repositório que você acabou de criar.
5.  A Netlify detectará automaticamente que é um projeto Next.js. As configurações de build devem ser:
    - **Build command:** `npm run build`
    - **Publish directory:** `.next`
6.  Clique em **"Deploy site"**.

---

### Passo 3: Configurar Variáveis de Ambiente

É crucial que as chaves da API Blackcat não sejam expostas no código. Você deve configurá-las como variáveis de ambiente na Netlify.

1.  No painel do seu site na Netlify, vá para **Site settings > Build & deploy > Environment**.
2.  Clique em **"Edit variables"** e adicione as seguintes variáveis:
    - **Key:** `BLACKCAT_PUBLIC_KEY`
      **Value:** `pk_QeH6GwZYP3KPXMdRPDIC9VzFo8CDqLATI7f764w1KQxkYRtB`
    - **Key:** `BLACKCAT_SECRET_KEY`
      **Value:** `sk_jatFTlsz-CMluRfzHixO_ax-b5l9gTH2ulxu8-pujt5piFu8`
3.  Salve as variáveis.

---

### Passo 4: Ativar o Deploy Contínuo com a Dyad

Agora, a cada vez que você fizer um `push` para a branch `main` do seu repositório GitHub, a Netlify irá automaticamente construir e publicar seu site.

A IA Dyad pode fazer isso por você! Sempre que você pedir para ela salvar ou alterar o código, ela fará o commit e o push diretamente para o seu repositório, acionando um novo deploy na Netlify.

---

### Resumo

- Seu código está no GitHub.
- A Netlify está conectada ao GitHub e configurada para fazer o deploy.
- As variáveis de ambiente estão seguras na Netlify.
- A Dyad pode agora sincronizar as alterações com o GitHub, que por sua vez atualizará seu site na Netlify automaticamente.

Seu site está pronto para ser atualizado de forma contínua e automática!