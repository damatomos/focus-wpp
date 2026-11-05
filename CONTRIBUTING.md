# Como contribuir com o Foco WA

Obrigado pelo interesse em melhorar o projeto.

1. Verifique se já existe uma issue para a melhoria ou o bug.
2. Faça um fork do repositório e crie uma branch (`fix/nome-do-ajuste` ou `feat/nome-da-funcionalidade`).
3. Faça alterações pequenas, preservando os três modos de visualização.
4. Execute `python scripts/validate.py` e, se possível, `node --check content.js` e `node --check popup.js`.
5. Teste manualmente no WhatsApp Web com conversas abertas, modo inicial sem conversa e alternância entre os três modos.
6. Abra um pull request explicando o comportamento anterior e o novo comportamento.

## Segurança e privacidade

Não inclua tokens, números de telefone, mensagens, cookies, dados de sessão ou capturas não anonimizadas em issues e pull requests. A extensão não deve coletar nem enviar dados pessoais a serviços externos.

## Versão

Ao preparar uma atualização para a loja, altere a propriedade `version` em `manifest.json`, atualize o `CHANGELOG.md` e, se necessário, o texto de versão do popup.

## Licença

Ao contribuir, você concorda em disponibilizar suas contribuições sob a licença MIT do repositório.
