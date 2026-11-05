/* Foco WA 1.3 — interface local do WhatsApp Web.
 * Não lê textos das mensagens e não transmite dados.
 */
(() => {
  'use strict';
  // Uma aba aberta antes da instalação pode receber a injeção pelo popup.
  // Evita registrar observadores/atalhos mais de uma vez.
  if (globalThis.__FOCO_WA_13_READY__) return;
  globalThis.__FOCO_WA_13_READY__ = true;

  const KEY = 'focoWaModo';
  const MODES = ['normal', 'compacto', 'oculto'];
  const LABELS = { normal: 'Normal', compacto: 'Somente fotos', oculto: 'Oculto' };
  const AVATAR_SELECTOR = [
    '[data-testid*="avatar" i] img',
    'img[src]',
    '[data-testid*="avatar" i]',
    '[data-testid*="profile-pic" i]',
    '[role="img"]',
    '[style*="background-image" i]',
    '[data-icon="default-user"]'
  ].join(',');

  let mode = 'normal';
  let shell = null;
  let conversation = null;
  let control = null;
  let timer = null;
  let lastSide = null;

  const validMode = value => MODES.includes(value) ? value : 'normal';

  function saveMode() {
    try { chrome.storage.local.set({ [KEY]: mode }); }
    catch (error) { console.warn('[Foco WA] Não foi possível salvar o modo.', error); }
  }

  function setMode(next, save = false) {
    mode = validMode(next);
    sync();
    if (save) saveMode();
  }

  function cycleMode() {
    setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length], true);
  }

  function getSide() {
    return document.querySelector('#side') || document.querySelector('#pane-side');
  }

  function bounds(el) {
    const r = el?.getBoundingClientRect();
    return r && r.width > 0 && r.height > 0 ? r : null;
  }

  function findMainSibling(side) {
    const main = document.querySelector('#main');
    if (!main) return null;
    let node = side;
    while (node.parentElement && node.parentElement !== document.body) {
      const candidate = [...node.parentElement.children].find(child => child !== node && (child === main || child.contains(main)));
      if (candidate) return { left: node, right: candidate };
      node = node.parentElement;
    }
    return null;
  }

  function findRightSibling(left) {
    const parent = left.parentElement;
    if (!parent) return null;
    const main = document.querySelector('#main');
    const children = [...parent.children].filter(el => el !== left);
    if (main) {
      const found = children.find(el => el === main || el.contains(main));
      if (found) return found;
    }
    const leftRect = bounds(left);
    if (!leftRect) return null;
    // A tela inicial do WhatsApp pode não possuir #main. Nesse caso,
    // a região à direita é identificada pela posição, não pelo ID.
    return children
      .map(el => ({ el, rect: bounds(el) }))
      .filter(({rect}) => rect && rect.left >= leftRect.right - 12 && rect.width >= 160)
      .sort((a, b) => a.rect.left - b.rect.left)[0]?.el || null;
  }

  function findByGeometry(side) {
    const sideRect = bounds(side);
    if (!sideRect) return null;
    let best = side;
    let node = side;
    // Encontra o ancestral mais externo que ainda ocupa SÓ a coluna
    // da lista. Assim, a barra vertical de navegação permanece intacta.
    while (node.parentElement && node.parentElement !== document.body) {
      const ancestor = node.parentElement;
      const rect = bounds(ancestor);
      if (!rect) break;
      const aligned = Math.abs(rect.left - sideRect.left) <= 24;
      const sameColumn = rect.width >= sideRect.width - 20 && rect.width <= sideRect.width + 64;
      if (!aligned || !sameColumn) break;
      best = ancestor;
      node = ancestor;
    }
    return { left: best, right: findRightSibling(best) };
  }

  function locatePanels() {
    const side = getSide();
    if (!side) return null;
    // Quando a coluna está oculta, o retângulo tem largura zero.
    // Reutilizamos a referência válida para conseguir restaurá-la.
    if (shell?.isConnected && shell.contains(side)) {
      return { left: shell, right: findRightSibling(shell) || conversation };
    }
    return findMainSibling(side) || findByGeometry(side);
  }

  function rowsIn(pane) {
    const matches = pane.querySelectorAll(
      '[role="row"][data-testid^="list-item-"], [data-testid="cell-frame-container"], [role="listitem"]'
    );
    const rows = [...matches].map(el => el.closest('[role="row"], [role="listitem"]') || el);
    if (rows.length) return [...new Set(rows)];
    return [...pane.querySelectorAll('[role="row"]')].filter(el => el.querySelector(AVATAR_SELECTOR));
  }

  function markRow(row) {
    if (!row?.isConnected) return;
    const avatar = row.querySelector(AVATAR_SELECTOR);
    // As linhas do WhatsApp são recicladas à medida que se rola a lista.
    // Limpa marcações antigas, mas nunca exclui ou substitui o próprio chat.
    row.querySelectorAll('[data-fwa-keep], [data-fwa-hide], [data-fwa-avatar]')
      .forEach(el => {
        el.removeAttribute('data-fwa-keep');
        el.removeAttribute('data-fwa-hide');
        el.removeAttribute('data-fwa-avatar');
      });
    row.setAttribute('data-fwa-row', '');

    let visual = avatar;
    if (!visual) {
      visual = row.querySelector('[data-fwa-placeholder]');
      if (!visual) {
        visual = document.createElement('span');
        visual.setAttribute('data-fwa-placeholder', '');
        visual.setAttribute('aria-hidden', 'true');
        visual.textContent = '●';
        row.append(visual);
      }
    }
    visual.setAttribute('data-fwa-avatar', '');
    let node = visual;
    while (node && node !== row) {
      node.setAttribute('data-fwa-keep', '');
      const parent = node.parentElement;
      if (!parent) break;
      for (const sibling of parent.children) {
        if (sibling !== node) sibling.setAttribute('data-fwa-hide', '');
      }
      node = parent;
    }
  }

  function annotateRows() {
    if (mode !== 'compacto' || !shell) return;
    const pane = shell.querySelector('#pane-side') || (shell.id === 'pane-side' ? shell : null);
    if (!pane) return;
    for (const row of rowsIn(pane)) markRow(row);
  }

  function ensureControl() {
    if (control?.isConnected) return;
    control = document.createElement('button');
    control.type = 'button';
    control.id = 'fwa-mode-control';
    control.innerHTML = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/><circle cx="6" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="6" cy="15" r="1" fill="currentColor" stroke="none"/></svg>';
    control.addEventListener('click', cycleMode);
    document.body.append(control);
  }

  function positionControl() {
    if (!control) return;
    if (!shell?.isConnected) { control.hidden = true; return; }

    // O cabeçalho do #main contém a foto e o nome do contato. Antes o botão
    // ficava sobre a foto porque usava a posição SUPERIOR do painel.
    // Ancorá-lo pelo limite INFERIOR do cabeçalho evita essa sobreposição.
    const main = document.querySelector('#main');
    const mainRect = bounds(main);
    const header = main?.querySelector('header, [role="banner"]');
    const candidateHeaderRect = bounds(header);
    const headerRect = candidateHeaderRect && mainRect &&
      candidateHeaderRect.top >= mainRect.top - 5 &&
      candidateHeaderRect.top <= mainRect.top + 100 &&
      candidateHeaderRect.width >= Math.min(mainRect.width * 0.5, 180)
      ? candidateHeaderRect : null;

    const rightRect = bounds(conversation) || mainRect;
    const shellRect = bounds(shell);
    // Fallback para versões do WhatsApp que não expõem um <header> semântico.
    const topAfterHeader = headerRect?.bottom ??
      ((mainRect?.top ?? rightRect?.top ?? shellRect?.top ?? 0) + 60);
    const x = (rightRect?.left ?? mainRect?.left ?? shellRect?.right ?? 68) + 10;
    const y = topAfterHeader + 10;
    control.style.left = `${Math.max(8, Math.min(window.innerWidth - 47, x))}px`;
    control.style.top = `${Math.max(8, Math.min(window.innerHeight - 47, y))}px`;
    control.hidden = false;
  }

  function paint() {
    if (!shell?.isConnected) return;
    // Atributo no HTML: permite corrigir divisórias do WhatsApp que não são
    // descendentes da lista de chats. Fora do modo normal, só essas bordas
    // serão removidas; ao voltar, as regras nativas voltam automaticamente.
    if (mode === 'normal') document.documentElement.removeAttribute('data-fwa-layout');
    else document.documentElement.setAttribute('data-fwa-layout', mode);
    shell.setAttribute('data-fwa-mode', mode);
    if (conversation?.isConnected) {
      conversation.setAttribute('data-fwa-expand', mode === 'normal' ? 'no' : 'yes');
    }
    annotateRows();
    ensureControl();
    control.dataset.mode = mode;
    control.setAttribute('aria-label', `Lista de contatos: ${LABELS[mode]}. Clique para alternar.`);
    control.title = `Lista: ${LABELS[mode]} • Alt + Shift + M`;
    positionControl();
  }

  function sync() {
    const found = locatePanels();
    if (!found) {
      document.documentElement.removeAttribute('data-fwa-layout');
      shell?.removeAttribute('data-fwa-mode');
      conversation?.removeAttribute('data-fwa-expand');
      shell = null;
      conversation = null;
      control && (control.hidden = true);
      return false;
    }
    const nextSide = getSide();
    if (shell !== found.left || conversation !== found.right || lastSide !== nextSide) {
      if (shell !== found.left) shell?.removeAttribute('data-fwa-mode');
      if (conversation !== found.right) conversation?.removeAttribute('data-fwa-expand');
      shell = found.left;
      conversation = found.right;
      lastSide = nextSide;
    }
    paint();
    return true;
  }

  function scheduleSync() {
    if (timer !== null) return;
    timer = window.setTimeout(() => { timer = null; sync(); }, 120);
  }

  function getStatus() {
    return { ok: true, detected: Boolean(shell?.isConnected), mode };
  }

  // Confirma ao popup que o script está realmente presente nesta aba.
  chrome.runtime.onMessage.addListener((message, _sender, respond) => {
    if (message?.type === 'fwa-state') {
      sync();
      respond(getStatus());
    } else if (message?.type === 'fwa-set-mode') {
      setMode(message.mode);
      respond(getStatus());
    }
  });

  document.addEventListener('keydown', event => {
    if (event.code !== 'KeyM' || !event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    cycleMode();
  }, true);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[KEY]) setMode(changes[KEY].newValue);
  });
  chrome.storage.local.get({ [KEY]: 'normal' }, data => setMode(data[KEY]));

  const observer = new MutationObserver(scheduleSync);
  function start() {
    if (!document.body) return;
    observer.observe(document.body, { childList: true, subtree: true });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  window.addEventListener('resize', positionControl);
})();
