# Foco WA 👁️

**Mais espaço para conversar no WhatsApp Web.**

O **Foco WA** é uma extensão independente para navegadores baseados em Chromium que permite recolher a coluna de conversas do WhatsApp Web. Você escolhe entre visualizar a lista normalmente, mostrar só os avatares ou ocultar a lista para ampliar a conversa atual.

> **Status:** versão `1.3.0` · Manifest V3 · sem dependências externas ou processo de compilação para desenvolvimento. O projeto não é afiliado, patrocinado ou endossado pela WhatsApp LLC ou pela Meta.

## Funcionalidades

| Modo | O que acontece |
| --- | --- |
| **Normal** | Exibe a lista como no WhatsApp Web original, com nomes, filtros e prévias. |
| **Somente fotos** | Reduz a lista a aproximadamente 84 px, mantendo os avatares clicáveis e a rolagem. |
| **Oculto** | Oculta a lista de contatos e dá mais espaço à conversa aberta. |

- **Controle na conversa:** botão abaixo do cabeçalho (foto e nome) para alternar entre os três modos.
- **Atalho:** `Alt + Shift + M` para alternar `Normal → Somente fotos → Oculto → Normal`.
- **Popup:** escolha o modo pelo ícone da extensão no navegador.
- **Preferência persistente:** o modo selecionado é armazenado localmente pela extensão.
- **Interferência mínima:** não substitui a interface nem as conversas, apenas altera o layout no navegador.

## Compatibilidade

- **Brave:** utilizado e confirmado em um ambiente real pelo autor do projeto.
- **Chrome, Edge e outros Chromium:** a arquitetura Manifest V3 é compatível, mas cada navegador ainda precisa ser testado.
- **Firefox e Safari:** não são suportados oficialmente por esta versão; podem precisar de adaptação.

> O WhatsApp Web muda seu HTML/CSS sem aviso. Se algo deixar de funcionar, abra uma [issue](../../issues) com o navegador, a versão e uma descrição do problema, sem expor conversas ou dados pessoais.

## Instalação para desenvolvimento

O projeto não precisa de Node.js, npm ou outro framework para funcionar.

### 1. Obtenha os arquivos

Clone o repositório:

```bash
git clone https://github.com/SEU-USUARIO/foco-wa.git
cd foco-wa
```

Ou use **Code → Download ZIP** no GitHub e extraia o conteúdo. Substitua `SEU-USUARIO` pelo seu usuário do GitHub quando publicar o repositório.

### 2. Carregue a extensão

| Navegador | Endereço |
| --- | --- |
| Brave | `brave://extensions` |
| Chrome | `chrome://extensions` |
| Edge | `edge://extensions` |
| Vivaldi | `vivaldi://extensions` |

1. Abra a página de extensões.
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** (*Load unpacked*).
4. Selecione **a pasta raiz do projeto**, a mesma que contém `manifest.json`.
5. Abra ou atualize <https://web.whatsapp.com/> e selecione um modo no popup do Foco WA.

> Se a extensão não modificar a interface, atualize a aba do WhatsApp Web (`F5`) e abra uma conversa. As versões recentes também tentam aplicar o modo por injeção ao usar o popup.

### Atualizar depois de editar o código

1. Salve as alterações nos arquivos.
2. Na página de extensões do navegador, clique em **Recarregar** no cartão do Foco WA.
3. Atualize a aba do WhatsApp Web (`F5`).

## Estrutura do repositório

```text
foco-wa/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── bug_report.md
│   └── workflows/
│       └── validate.yml
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/
│   ├── build.py
│   └── validate.py
├── .editorconfig
├── .gitattributes
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── PRIVACY.md
├── README.md
├── content.css        # Estilos aplicados ao WhatsApp Web
├── content.js         # Identificação e ajuste dos painéis + atalho
├── manifest.json      # Manifest V3 e permissões
├── popup.css          # Aparência do popup
├── popup.html         # Controles dos três modos
└── popup.js           # Preferências e comunicação com a aba
```

## Desenvolvimento e validação

O código é JavaScript, CSS e HTML simples. Para validar a estrutura (Python 3.9+):

```bash
python scripts/validate.py
```

Opcionalmente, valide também a sintaxe JavaScript, se tiver Node.js instalado:

```bash
node --check content.js
node --check popup.js
```

### Gerar um ZIP para a loja

Execute na raiz do projeto:

```bash
python scripts/build.py
```

O arquivo `dist/foco-wa-1.3.0.zip` será gerado contendo **somente** o `manifest.json`, scripts, CSS, popup e ícones — com o manifesto na raiz do ZIP. Arquivos do GitHub, documentação e arquivos locais não entram no pacote.

Esse ZIP é voltado ao envio para a Chrome Web Store / Microsoft Edge Add-ons. A aprovação continua sujeita à revisão e às políticas de cada loja.

## Publicação no GitHub

Se você ainda não tem um repositório remoto:

```bash
git init
git add .
git commit -m "feat: versao inicial do Foco WA 1.3.0"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/foco-wa.git
git push -u origin main
```

Crie antes um repositório **vazio** chamado `foco-wa` no GitHub e substitua `SEU-USUARIO` pelo seu nome de usuário. Se você já clonou o repositório, não precisa executar `git init` nem `git remote add origin` novamente.

## Privacidade e permissões

O Foco WA funciona apenas em `https://web.whatsapp.com/`. Ele identifica elementos visuais, incluindo a lista e os avatares, para ajustar a apresentação da página. Não lê o conteúdo textual das mensagens, não altera o envio de mensagens e **não envia dados a servidores externos**.

| Permissão | Finalidade |
| --- | --- |
| `storage` | Salvar localmente o modo escolhido. |
| `activeTab` | Acessar a aba ativa quando você usa o popup. |
| `scripting` | Injetar o script e o CSS se a aba já estava aberta antes da instalação. |
| Acesso a `web.whatsapp.com` | Aplicar o layout exclusivamente nesse site. |

Leia a [Política de Privacidade](PRIVACY.md) antes de publicar. Revise o documento se modificar o comportamento de coleta de dados ou adicionar serviços externos.

## Limitações conhecidas

- A lista é detectada pela estrutura atual do WhatsApp Web; alterações do site podem exigir uma atualização do Foco WA.
- No modo **Somente fotos**, pesquisa, filtros e nomes não ficam visíveis. Use **Normal** para acessá-los.
- Quando o WhatsApp Web está em uma tela inicial sem conversa aberta, alguns elementos de layout podem não existir; ao abrir uma conversa, o ajuste pode ser aplicado.
- A interface foi validada parcialmente com páginas simuladas no Chromium, além do uso real relatado no Brave. Não há suíte automatizada de interface contra o WhatsApp Web real.

## Contribuições e licença

Contribuições, relatos de problemas e melhorias são bem-vindos. Consulte [CONTRIBUTING.md](CONTRIBUTING.md) e [CHANGELOG.md](CHANGELOG.md).

Distribuído sob a licença [MIT](LICENSE). Ao publicar, confirme que deseja manter esta licença permissiva e ajuste o titular do copyright se necessário.

---

**Foco WA** — projeto independente. “WhatsApp” e suas marcas pertencem aos respectivos titulares.
