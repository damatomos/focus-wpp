const KEY = 'focoWaModo';
const validModes = new Set(['normal', 'compacto', 'oculto']);
const choices = [...document.querySelectorAll('.option')];
const status = document.querySelector('#status');
const WHATSAPP = /^https:\/\/web\.whatsapp\.com(?:\/|$)/i;

function display(mode) {
  const selected = validModes.has(mode) ? mode : 'normal';
  choices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === selected)));
}

function showStatus(message) { status.textContent = message; }

async function whatsappTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab && WHATSAPP.test(tab.url || '') ? tab : null;
}

async function ensureScript(tabId) {
  try {
    return await chrome.tabs.sendMessage(tabId, { type: 'fwa-state' });
  } catch {
    // Uma aba que já estava aberta na instalação não recebeu os content scripts.
    // Instala agora, sem recarregar e sem interromper um rascunho de mensagem.
    await chrome.scripting.insertCSS({ target: { tabId }, files: ['content.css'] });
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
    return await chrome.tabs.sendMessage(tabId, { type: 'fwa-state' });
  }
}

async function connect() {
  const tab = await whatsappTab();
  if (!tab) {
    showStatus('Abra o WhatsApp Web nesta aba para aplicar os ajustes.');
    return null;
  }
  try {
    const result = await ensureScript(tab.id);
    if (!result?.detected) showStatus('Aguardando a lista de conversas aparecer no WhatsApp Web.');
    else showStatus('Conectado ao WhatsApp Web. Selecione um modo.');
    return tab;
  } catch (error) {
    console.warn('[Foco WA] Injeção do script falhou:', error);
    showStatus('Não foi possível acessar a página. Atualize o WhatsApp Web com F5.');
    return null;
  }
}

choices.forEach(button => button.addEventListener('click', async () => {
  const mode = button.dataset.mode;
  if (!validModes.has(mode)) return;
  try {
    await chrome.storage.local.set({ [KEY]: mode });
    display(mode);
    const tab = await whatsappTab();
    if (!tab) {
      showStatus('Modo salvo. Abra o WhatsApp Web para aplicar.');
      return;
    }
    await ensureScript(tab.id);
    const result = await chrome.tabs.sendMessage(tab.id, { type: 'fwa-set-mode', mode });
    showStatus(result?.detected
      ? 'Modo aplicado no WhatsApp Web.'
      : 'Modo salvo, mas a lista ainda não foi localizada. Tente F5.');
  } catch (error) {
    console.warn('[Foco WA] Falha ao aplicar:', error);
    showStatus('Modo salvo. Atualize o WhatsApp Web com F5.');
  }
}));

chrome.storage.local.get({ [KEY]: 'normal' })
  .then(result => display(result[KEY]))
  .catch(() => showStatus('Não foi possível ler a preferência.'));

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[KEY]) display(changes[KEY].newValue);
});

connect();
