/* ═══════════════════════════════════════════════════
   Vovó Dinha Ateliê — main.js
   Funcionalidades:
   • Render dinâmico do grid de produtos
   • Busca em tempo real (toolbar + sidebar)
   • Filtro por categoria (checkboxes)
   • Filtro de preço máximo (range slider)
   • Ordenação real (novidades / menor / maior preço)
   • Tags removíveis que filtram o grid
   • Carrinho lateral com qty, remoção e total
   • Carrinho lateral com itens, qtd e total
   • Favoritos persistentes
   • Menu hambúrguer mobile
   • Botão "Ver coleção" com scroll suave
═══════════════════════════════════════════════════ */

// ─── BASE DE DADOS ───────────────────────────────
const PRODUTOS = [
  {
    id: 1, nome: 'Ecobag Dia das Mães',
    desc: 'Ecobag com argolinha do lado de fora para pendurar chaves, e bolso interno com zíper para cartões/documentos.',
    preco: 45, precoOriginal: null,
    img: 'ecobag.jpeg', bg: '#fde8e7',
    badge: 'Novo', categoria: 'bolsas', fav: false,
  },
  {
    id: 2, nome: 'Necessaire personalizada',
    desc: 'Necessaire com nome bordado de forma personalizada, forrada internamente.',
    preco: 40, precoOriginal: null,
    img: 'necessaire.jpeg', bg: '#e1f5ee',
    badge: null, categoria: 'necessaires', fav: false,
  },
  {
    id: 3, nome: 'Prendedor de chupeta',
    desc: 'Prendedores para chupeta com cores personalizadas.',
    preco: 17, precoOriginal: null,
    img: 'prendedor.jpeg', bg: '#faeeda',
    badge: null, categoria: 'enxoval', fav: true,
  },
  {
    id: 4, nome: 'Toalha de academia',
    desc: 'Toalha com bordado de academia, para deixar seus treinos melhores.',
    preco: 40, precoOriginal: null,
    img: 'toalhaAcad.jpeg', bg: '#eeedfe',
    badge: null, categoria: 'toalhas', fav: false,
  },
  {
    id: 5, nome: 'Toalha hora do banho',
    desc: 'Toalha personalizada com nome do bebê.',
    preco: 145, precoOriginal: 110,
    img: 'toalhaBanho.jpeg', bg: '#fcebeb',
    badge: null, categoria: 'toalhas', fav: false,
  },
  {
    id: 6, nome: 'Toalha escolar',
    desc: 'Toalha escolar com nome bordado.',
    preco: 40, precoOriginal: null,
    img: 'toalhaEscola.jpeg', bg: '#e6f1fb',
    badge: null, categoria: 'toalhas', fav: false,
  },
  {
    id: 7, nome: 'Toalha escolar Pequeno Príncipe',
    desc: 'Toalha escolar personalizada do Pequeno Príncipe.',
    preco: 45, precoOriginal: null,
    img: 'toalhaPrincipe.jpeg', bg: '#eaf3de',
    badge: 'Novo', categoria: 'toalhas', fav: false,
  },
  {
    id: 8, nome: 'Porta Terço',
    desc: 'Bolsinha porta terço de Nossa Senhora.',
    preco: 35, precoOriginal: null,
    img: 'portaTerco.jpeg', bg: '#fbeaf0',
    badge: null, categoria: 'bolsas', fav: false,
  },
];

// ─── ESTADO ─────────────────────────────────────
const state = {
  busca: '',
  categorias: [],          // vazio = todas as categorias
  precoMax: 500,
  ordem: 'novidades',
  carrinho: [],            // [{ produto, qty }]
  carrinhoAberto: false,
  menuAberto: false,
};

// ─── UTILITÁRIOS ────────────────────────────────
const fmt = v => 'R$' + v.toFixed(2).replace('.', ',');

function getProdutosFiltrados() {
  let lista = [...PRODUTOS];

  if (state.busca.trim()) {
    const q = state.busca.toLowerCase();
    lista = lista.filter(p =>
      p.nome.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    );
  }

  if (state.categorias.length > 0) {
    lista = lista.filter(p => state.categorias.includes(p.categoria));
  }

  lista = lista.filter(p => p.preco <= state.precoMax);

  if (state.ordem === 'menor') lista.sort((a, b) => a.preco - b.preco);
  else if (state.ordem === 'maior') lista.sort((a, b) => b.preco - a.preco);

  return lista;
}

// ─── RENDER GRID ────────────────────────────────
function renderGrid() {
  const grid = document.getElementById('grid-produtos');
  const lista = getProdutosFiltrados();

  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="grid-vazio">
        <div style="font-size:52px;margin-bottom:14px">🧵</div>
        <p>Nenhum produto encontrado com esses filtros.</p>
        <button onclick="limparFiltros()" style="margin-top:14px;padding:8px 20px;background:var(--coral);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px">
          Limpar filtros
        </button>
      </div>`;
    return;
  }

  grid.innerHTML = lista.map((p, i) => `
    <div class="produto-card" style="animation-delay:${i * 0.06}s" data-id="${p.id}">
      <div class="produto-img" style="background:${p.bg}">
        ${p.badge ? `<span class="produto-badge">${p.badge}</span>` : ''}
        <button class="produto-fav" data-id="${p.id}" title="Favoritar">
          ${p.fav ? '❤️' : '🤍'}
        </button>
        <img src="${p.img}" alt="${p.nome}" onerror="this.style.display='none'">
      </div>
      <div class="produto-info">
        <div class="produto-nome">${p.nome}</div>
        <div class="produto-desc">${p.desc}</div>
        <div class="produto-footer">
          <div class="produto-preco">
            ${fmt(p.preco)}
            ${p.precoOriginal ? `<small><s>${fmt(p.precoOriginal)}</s></small>` : ''}
          </div>
          <button class="btn-add" data-id="${p.id}">+ Add</button>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.btn-add').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addCarrinho(+btn.dataset.id, btn);
    })
  );

  grid.querySelectorAll('.produto-fav').forEach(btn =>
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleFav(+btn.dataset.id);
    })
  );
}

// ─── CARRINHO ───────────────────────────────────
function addCarrinho(id, btnEl) {
  const produto = PRODUTOS.find(p => p.id === id);
  if (!produto) return;

  const item = state.carrinho.find(i => i.produto.id === id);
  item ? item.qty++ : state.carrinho.push({ produto, qty: 1 });

  atualizarBadge();
  animarBtn(btnEl);
  // Abre carrinho automaticamente na primeira adição
  if (state.carrinho.length === 1 && !state.carrinhoAberto) toggleCarrinho();
}

function removerCarrinho(id) {
  state.carrinho = state.carrinho.filter(i => i.produto.id !== id);
  atualizarBadge();
  renderCarrinhoPanel();
}

function alterarQty(id, delta) {
  const item = state.carrinho.find(i => i.produto.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removerCarrinho(id);
  else { atualizarBadge(); renderCarrinhoPanel(); }
}

function atualizarBadge() {
  const total = state.carrinho.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = total;

  const cartBtn = document.querySelector('.cart-btn');
  cartBtn.classList.remove('cart-pulse');
  void cartBtn.offsetWidth;
  cartBtn.classList.add('cart-pulse');
}

function animarBtn(btn) {
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent = '✓ Adicionado';
  btn.style.cssText = 'background:#5bbfb5;color:#fff';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.cssText = '';
  }, 1400);
}

function toggleCarrinho() {
  state.carrinhoAberto = !state.carrinhoAberto;
  document.getElementById('carrinho-panel').classList.toggle('aberto', state.carrinhoAberto);
  document.getElementById('carrinho-overlay').classList.toggle('ativo', state.carrinhoAberto);
  if (state.carrinhoAberto) renderCarrinhoPanel();
}

function renderCarrinhoPanel() {
  const body   = document.getElementById('carrinho-body');
  const footer = document.getElementById('carrinho-footer');

  if (state.carrinho.length === 0) {
    body.innerHTML = `
      <div class="carrinho-vazio">
        <div style="font-size:48px">🛒</div>
        <p>Seu carrinho está vazio</p>
      </div>`;
    footer.innerHTML = '';
    return;
  }

  body.innerHTML = state.carrinho.map(item => `
    <div class="cart-item" data-id="${item.produto.id}">
      <div class="cart-item-img" style="background:${item.produto.bg}">
        <img src="${item.produto.img}" alt="${item.produto.nome}" onerror="this.style.display='none'">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-nome">${item.produto.nome}</div>
        <div class="cart-item-preco">${fmt(item.produto.preco * item.qty)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-id="${item.produto.id}" data-delta="-1">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" data-id="${item.produto.id}" data-delta="1">+</button>
          <button class="cart-remove" data-id="${item.produto.id}" title="Remover">🗑</button>
        </div>
      </div>
    </div>
  `).join('');

  const totalVal = state.carrinho.reduce((s, i) => s + i.produto.preco * i.qty, 0);
  const totalItens = state.carrinho.reduce((s, i) => s + i.qty, 0);
  footer.innerHTML = `
    <div class="cart-total">
      <span>Total (${totalItens} ${totalItens === 1 ? 'item' : 'itens'})</span>
      <strong>${fmt(totalVal)}</strong>
    </div>
    <button class="btn-whatsapp" onclick="finalizarPedidoWhatsApp()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.535 5.858L.057 23.882a.5.5 0 0 0 .614.612l6.218-1.635A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 0 1-5.13-1.424l-.368-.22-3.812 1.003 1.013-3.7-.24-.38A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      Finalizar pelo WhatsApp
    </button>`;

  body.querySelectorAll('.qty-btn').forEach(btn =>
    btn.addEventListener('click', () => alterarQty(+btn.dataset.id, +btn.dataset.delta))
  );
  body.querySelectorAll('.cart-remove').forEach(btn =>
    btn.addEventListener('click', () => removerCarrinho(+btn.dataset.id))
  );
}

// ─── FAVORITOS ───────────────────────────────────
function toggleFav(id) {
  const p = PRODUTOS.find(p => p.id === id);
  if (p) { p.fav = !p.fav; renderGrid(); }
}

// ─── FILTROS ─────────────────────────────────────
function limparFiltros() {
  state.busca = '';
  state.categorias = [];
  state.precoMax = 500;
  state.ordem = 'novidades';

  document.querySelector('.search-bar input').value = '';
  document.querySelector('.search-input').value = '';
  document.querySelectorAll('.check-item input[type="checkbox"]').forEach(cb => cb.checked = false);

  const range = document.getElementById('preco-range');
  range.value = 500;
  document.getElementById('preco-val').textContent = 'R$500';
  atualizarGradienteRange(range);

  document.querySelectorAll('.sort-btn').forEach((b, i) => b.classList.toggle('active', i === 0));

  renderGrid();
}

function atualizarGradienteRange(rangeEl) {
  const pct = ((rangeEl.value - rangeEl.min) / (rangeEl.max - rangeEl.min)) * 100;
  rangeEl.style.background = `linear-gradient(to right, var(--coral) 0%, var(--coral) ${pct}%, var(--borda) ${pct}%)`;
}

// ─── MENU HAMBÚRGUER ─────────────────────────────
function toggleMenu() {
  state.menuAberto = !state.menuAberto;
  const menu     = document.getElementById('mobile-menu');
  const hamb     = document.querySelector('.nav-hamburguer');
  menu.classList.toggle('aberto', state.menuAberto);
  hamb.classList.toggle('aberto', state.menuAberto);
}

// ─── WHATSAPP CHECKOUT ───────────────────────────
const WHATSAPP_NUMBER = '5511975159558'; // ← Substitua pelo número da dona com DDI+DDD (sem espaços ou símbolos)

function finalizarPedidoWhatsApp() {
  if (state.carrinho.length === 0) return;

  const linhas = state.carrinho.map(item =>
    `• ${item.produto.nome} (x${item.qty}) — ${fmt(item.produto.preco * item.qty)}`
  );

  const totalVal = state.carrinho.reduce((s, i) => s + i.produto.preco * i.qty, 0);

  const mensagem =
    `Olá! Gostaria de fazer um pedido pelo site\n\n` +
    `*Itens selecionados:*\n${linhas.join('\n')}\n\n` +
    `*Total: ${fmt(totalVal)}*\n\n` +
    `Poderia me ajudar com a finalização?`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
}

// ─── INICIALIZAÇÃO ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Render inicial
  renderGrid();

  // ── Injetar painel do carrinho ──
  document.body.insertAdjacentHTML('beforeend', `
    <div id="carrinho-overlay"></div>
    <aside id="carrinho-panel">
      <div class="carrinho-header">
        <h3>🛒 Meu Carrinho</h3>
        <button class="carrinho-fechar" id="carrinho-fechar" aria-label="Fechar carrinho">✕</button>
      </div>
      <div id="carrinho-body" class="carrinho-body"></div>
      <div id="carrinho-footer" class="carrinho-footer"></div>
    </aside>
  `);

  // ── Injetar menu mobile ──
  document.querySelector('nav').insertAdjacentHTML('afterend', `
    <div id="mobile-menu">
      <a href="#grid-produtos" onclick="toggleMenu()">🛍 Produtos</a>
      <a href="#" onclick="toggleMenu()">📞 Contato</a>

    </div>
  `);

  // ── Eventos: carrinho ──
  document.querySelector('.cart-btn').addEventListener('click', toggleCarrinho);
  document.getElementById('carrinho-fechar').addEventListener('click', toggleCarrinho);
  document.getElementById('carrinho-overlay').addEventListener('click', toggleCarrinho);

  // ── Eventos: hambúrguer ──
  document.querySelector('.nav-hamburguer').addEventListener('click', toggleMenu);

  // ── Eventos: busca toolbar ──
  document.querySelector('.search-bar input').addEventListener('input', e => {
    state.busca = e.target.value;
    // Sincroniza sidebar
    document.querySelector('.search-input').value = e.target.value;
    renderGrid();
  });

  // ── Eventos: busca sidebar ──
  document.querySelector('.search-input').addEventListener('input', e => {
    state.busca = e.target.value;
    document.querySelector('.search-bar input').value = e.target.value;
    renderGrid();
  });

  // ── Eventos: sort buttons ──
  const ordens = ['novidades', 'menor', 'maior'];
  document.querySelectorAll('.sort-btn').forEach((btn, i) => {
    btn.dataset.ordem = ordens[i];
    btn.addEventListener('click', () => {
      state.ordem = ordens[i];
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid();
    });
  });

  // ── Eventos: checkboxes de categoria ──
  const catMap = { 'Toalhas': 'toalhas', 'Necessaires': 'necessaires', 'Enxoval': 'enxoval', 'Bolsas': 'bolsas' };
  document.querySelectorAll('.check-item input[type="checkbox"]').forEach(cb => {
    const label = cb.closest('.check-item').querySelector('.check-item-label').textContent.trim();
    const cat   = catMap[label];
    if (!cat) return;
    cb.addEventListener('change', () => {
      if (cb.checked) { if (!state.categorias.includes(cat)) state.categorias.push(cat); }
      else { state.categorias = state.categorias.filter(c => c !== cat); }
      renderGrid();
    });
  });

  // ── Eventos: range de preço ──
  const range = document.getElementById('preco-range');
  range.addEventListener('input', () => {
    state.precoMax = +range.value;
    document.getElementById('preco-val').textContent = `R$${range.value}`;
    atualizarGradienteRange(range);
    renderGrid();
  });
  atualizarGradienteRange(range); // inicializa gradiente

  // ── Eventos: tags removíveis ──
  document.querySelectorAll('.tag').forEach(tag => {
    tag.querySelector('.remove').addEventListener('click', () => {
      tag.style.cssText = 'opacity:0;transform:scale(0.8);transition:all .2s';
      setTimeout(() => tag.remove(), 200);
    });
  });

  // ── Eventos: color dots ──
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  // ── Eventos: size pills ──
  document.querySelectorAll('.size-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // ── Botão "Ver coleção" → scroll suave ──
  document.querySelector('.banner-cta').addEventListener('click', () => {
    document.getElementById('grid-produtos').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ── Links de nav: Produtos ──
  document.querySelector('.nav-links a').addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('grid-produtos').scrollIntoView({ behavior: 'smooth' });
  });
});
