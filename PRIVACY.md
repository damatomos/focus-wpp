# Política de Privacidade — Foco WA

**Versão do documento:** 1.0 (05/11/2026)

O **Foco WA** é uma extensão independente que personaliza visualmente a coluna de conversas do WhatsApp Web. A extensão é executada no navegador do usuário, na página `https://web.whatsapp.com/`.

## Dados utilizados

- **Preferência de visualização:** a opção `normal`, `compacto` ou `oculto` é gravada por `chrome.storage.local` no armazenamento local da extensão.
- **Elementos visuais da página:** a extensão localiza a coluna de conversas, seus itens e os elementos dos avatares para modificar exclusivamente a apresentação da interface.
- **Aba ativa:** quando o popup é utilizado, a extensão verifica se a aba atual corresponde ao WhatsApp Web e, se necessário, insere seu código nessa aba.

## O que não fazemos

- Não coletamos nem transmitimos mensagens, contatos, números telefônicos, fotos ou dados pessoais a servidores próprios ou terceiros.
- Não usamos ferramentas de análise, publicidade, rastreamento ou telemetria.
- Não armazenamos cópias de mensagens, histórico de conversas ou listas de contatos.
- Não vendemos informações dos usuários.

O código-fonte incluído neste repositório não contém requisições a serviços externos. A comunicação interna ocorre entre o popup, a página do WhatsApp Web e o armazenamento local da extensão.

## Compartilhamento e retenção

A preferência de visualização fica armazenada localmente no navegador enquanto os dados da extensão forem mantidos. O Foco WA não compartilha essa preferência com um servidor. Você pode apagá-la removendo os dados da extensão ou desinstalando-a, conforme as opções do navegador.

## Permissões solicitadas

- `storage`: salvar a preferência de visualização.
- `activeTab`: interagir com a aba ativa ao abrir o popup.
- `scripting`: aplicar o código de layout em uma aba do WhatsApp Web já aberta.
- `host_permissions` para `https://web.whatsapp.com/*`: limitar o acesso ao site onde a extensão funciona.

## Atualizações desta política

Se versões futuras mudarem o tratamento de dados, este documento deverá ser atualizado antes da publicação da nova versão.

## Contato

Abra uma [issue no GitHub](../../issues) do projeto para relatar problemas ou fazer perguntas. Depois de publicar o repositório, o mantenedor pode incluir um e-mail de contato público aqui.

## Independência

O Foco WA não é afiliado, autorizado ou endossado pela WhatsApp LLC ou pela Meta.
