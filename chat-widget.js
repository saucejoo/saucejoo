(function(){
  const FAQ = [
    {
      q: '포트폴리오에서 어떤 일을 하시나요?',
      keywords: ['포트폴리오', '일', '직무', '무엇', '하는', '프로덕트', '디자인', 'pm', 'ux'],
      a: '프로덕트 매니지먼트와 UX/UI 디자인을 함께 합니다. 모바일 앱·서비스 기획부터 화면 설계, 프로토타입까지요. 이 사이트 work 섹션에서 프로젝트별로 볼 수 있어요.'
    },
    {
      q: '다이노스(Dinos) 프로젝트가 뭔가요?',
      keywords: ['다이노스', 'dinos', '공룡', '카페', '앱'],
      a: '취향이 닮은 사람들의 카페 선택을 연결하는 모바일 앱이에요. 리뷰보다 “실제 선택” 데이터를 쓰고, 추천·리뷰 사이클·관계 확장 세 가지 핵심 기능이 있어요. 자세한 건 dinos.html 케이스 스터디를 봐 주세요!'
    },
    {
      q: '연락은 어떻게 하나요?',
      keywords: ['연락', '이메일', '메일', 'contact', '협업', '채용', '제안'],
      a: '협업·채용 제안은 포트폴리오 상단 링크(LinkedIn 등)나 이 채팅으로 남겨 주세요. 직접 답변이 필요한 질문은 연주가 확인 후 답할게요.'
    },
    {
      q: '채용 중이신가요?',
      keywords: ['채용', '구인', '일자리', '취업', '프리랜스'],
      a: '기회에 따라 열려 있어요. 역할·기간·팀 상황을 알려주시면 검토해 볼게요. 구체적인 포지션은 채팅이나 링크드인으로 편하게 문의해 주세요.'
    }
  ];

  const QUICK_CHIPS = [
    '포트폴리오 소개해줘',
    '다이노스가 뭐야?',
    '연락 방법 알려줘'
  ];

  const STORAGE_KEY = 'saucejoo_chat_v1';
  const MATCH_THRESHOLD = 0.42;

  const chatRoot = document.getElementById('chatRoot');
  if(!chatRoot) return;

  const chatPanel = document.getElementById('chatPanel');
  const chatLauncher = document.getElementById('chatLauncher');
  const chatWander = document.getElementById('chatWander');
  const chatClose = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatChips = document.getElementById('chatChips');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatBadge = document.getElementById('chatBadge');
  const adminToggle = document.getElementById('adminToggle');
  const adminPanel = document.getElementById('adminPanel');
  const adminClose = document.getElementById('adminClose');
  const adminBody = document.getElementById('adminBody');
  const workModal = document.getElementById('workModal');

  const sessionId = getOrCreateSessionId();
  let pollTimer = null;

  const CHEF_SVG = `<svg class="minimi-chef" viewBox="0 0 72 80" width="56" height="72" aria-hidden="true" focusable="false">
    <g class="chef-figure">
      <g class="chef-legs">
        <path class="chef-leg chef-leg--l" d="M30 58 L28 74" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>
        <path class="chef-leg chef-leg--r" d="M42 58 L44 74" stroke="#111" stroke-width="2.2" stroke-linecap="round"/>
      </g>
      <path d="M22 36 H50 V58 H22 Z" fill="#5cd3ff" stroke="#111" stroke-width="2"/>
      <rect x="26" y="48" width="20" height="7" rx="1" fill="#fff" stroke="#111" stroke-width="1.5"/>
      <circle cx="36" cy="26" r="11" fill="#fff" stroke="#111" stroke-width="2"/>
      <ellipse cx="36" cy="14" rx="15" ry="6" fill="#fff" stroke="#111" stroke-width="2"/>
      <rect x="28" y="10" width="16" height="6" rx="2" fill="#fff" stroke="#111" stroke-width="2"/>
      <g class="chef-arm">
        <path d="M48 40 Q58 36 62 46" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
        <ellipse cx="62" cy="48" rx="5" ry="4" fill="#5cd3ff" stroke="#111" stroke-width="2"/>
        <path d="M60 46 L66 54" stroke="#111" stroke-width="2" stroke-linecap="round"/>
      </g>
      <circle cx="32" cy="25" r="1.2" fill="#111"/>
      <circle cx="40" cy="25" r="1.2" fill="#111"/>
    </g>
  </svg>`;

  function mountChef(){
    if(!chatLauncher) return;
    chatLauncher.querySelector('.minimi-butterfly')?.remove();
    if(chatLauncher.querySelector('.minimi-chef')) return;
    chatLauncher.querySelector('img')?.remove();
    chatLauncher.insertAdjacentHTML('afterbegin', CHEF_SVG);
  }
  mountChef();

  function getOrCreateSessionId(){
    let id = localStorage.getItem('saucejoo_session');
    if(!id){
      id = 's_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('saucejoo_session', id);
    }
    return id;
  }

  function loadStore(){
    try{
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"messages":[],"pending":[]}');
    }catch{
      return { messages: [], pending: [] };
    }
  }

  function saveStore(store){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function formatTime(ts){
    return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }

  function normalize(text){
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function tokenize(text){
    return normalize(text).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  }

  function scoreFAQ(userText, item){
    const userTokens = new Set(tokenize(userText));
    const qTokens = tokenize(item.q);
    const keywords = item.keywords.map(normalize);
    let hits = 0;
    const total = Math.max(qTokens.length, keywords.length, 1);

    for(const t of qTokens){
      if(userTokens.has(t) || normalize(userText).includes(t)) hits += 1.2;
    }
    for(const kw of keywords){
      if(normalize(userText).includes(kw)) hits += 1.5;
    }
    if(normalize(userText).includes(normalize(item.q).slice(0, 8))) hits += 2;

    return hits / total;
  }

  function findFAQAnswer(text){
    let best = null;
    let bestScore = 0;
    for(const item of FAQ){
      const s = scoreFAQ(text, item);
      if(s > bestScore){
        bestScore = s;
        best = item;
      }
    }
    if(bestScore >= MATCH_THRESHOLD) return { answer: best.a };
    return null;
  }

  function escapeHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function appendMessage(role, text, opts = {}){
    const store = loadStore();
    store.messages.push({
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      sessionId,
      role,
      text,
      ts: Date.now(),
      ...opts
    });
    saveStore(store);
  }

  function appendPending(question){
    const store = loadStore();
    store.pending.push({
      id: 'p_' + Date.now(),
      sessionId,
      question,
      ts: Date.now(),
      status: 'pending'
    });
    saveStore(store);
    updateAdminBadge();
  }

  function ensureWelcome(){
    const store = loadStore();
    const mine = store.messages.filter(m => m.sessionId === sessionId);
    if(mine.length === 0){
      appendMessage('bot', '안녕하세요, 주방장 미니미예요.\n포트폴리오·다이노스·연락 같은 메뉴는 바로 안내할게요.\n아래 칩을 눌러보세요!');
    }
  }

  function renderMessages(){
    ensureWelcome();
    const store = loadStore();
    const mine = store.messages.filter(m => m.sessionId === sessionId);
    chatMessages.innerHTML = '';

    for(const m of mine){
      const el = document.createElement('div');
      if(m.pending){
        el.className = 'msg msg-pending';
        el.textContent = m.text;
      } else {
        el.className = 'msg ' + (m.role === 'user' ? 'msg-user' : 'msg-bot');
        el.innerHTML = escapeHtml(m.text).replace(/\n/g, '<br>');
        const time = document.createElement('span');
        time.className = 'msg-time';
        time.textContent = formatTime(m.ts);
        el.appendChild(time);
      }
      chatMessages.appendChild(el);
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function renderChips(){
    chatChips.innerHTML = '';
    for(const label of QUICK_CHIPS){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chat-chip';
      btn.textContent = label;
      btn.addEventListener('click', () => handleUserMessage(label));
      chatChips.appendChild(btn);
    }
  }

  function handleUserMessage(text){
    const trimmed = text.trim();
    if(!trimmed) return;

    appendMessage('user', trimmed);
    renderMessages();

    const match = findFAQAnswer(trimmed);
    if(match){
      setTimeout(() => {
        appendMessage('bot', match.answer, { auto: true });
        renderMessages();
      }, 400 + Math.random() * 300);
      return;
    }

    appendPending(trimmed);
    setTimeout(() => {
    appendMessage('bot',
      '음, 이건 제 레시피북에 없네요.\n연주 셰프한테 전달해 뒀으니 확인 후 답변드릴게요!',
      { auto: false }
    );
    appendMessage('pending', '⏳ 주방장 확인 대기 중…', { pending: true });
      renderMessages();
    }, 500);
  }

  function updateAdminBadge(){
    if(!chatBadge) return;
    const store = loadStore();
    const count = store.pending.filter(p => p.status === 'pending').length;
    chatBadge.textContent = String(count);
    chatBadge.classList.toggle('is-visible', count > 0);
  }

  function answerPending(pendingId, targetSession, replyText){
    const store = loadStore();
    const item = store.pending.find(p => p.id === pendingId);
    if(!item) return;
    item.status = 'answered';
    item.answeredAt = Date.now();
    item.answer = replyText;
    store.messages = store.messages.filter(
      m => !(m.sessionId === targetSession && m.pending)
    );
    store.messages.push({
      id: 'm_' + Date.now(),
      sessionId: targetSession,
      role: 'bot',
      text: replyText,
      ts: Date.now(),
      human: true
    });
    saveStore(store);
  }

  function renderAdmin(){
    if(!adminBody) return;
    const store = loadStore();
    const pending = store.pending.filter(p => p.status === 'pending');

    if(pending.length === 0){
      adminBody.innerHTML = '<p class="admin-empty">대기 중인 질문이 없어요.</p>';
      return;
    }

    adminBody.innerHTML = '';
    for(const p of pending){
      const wrap = document.createElement('div');
      wrap.className = 'pending-item';
      wrap.innerHTML =
        '<p class="pending-meta">' + formatTime(p.ts) + ' · session ' + p.sessionId.slice(0, 8) + '…</p>' +
        '<p>' + escapeHtml(p.question) + '</p>' +
        '<div class="pending-reply">' +
          '<input type="text" placeholder="답변 입력…" aria-label="답변">' +
          '<button type="button">전송</button>' +
        '</div>';
      const input = wrap.querySelector('input');
      const btn = wrap.querySelector('button');
      const send = () => {
        const reply = input.value.trim();
        if(!reply) return;
        answerPending(p.id, p.sessionId, reply);
        renderAdmin();
        renderMessages();
        updateAdminBadge();
      };
      btn.addEventListener('click', send);
      input.addEventListener('keydown', e => { if(e.key === 'Enter') send(); });
      adminBody.appendChild(wrap);
    }
  }

  function pollForReplies(){
    renderMessages();
    updateAdminBadge();
  }

  /* ━━━ 미니미 셰프 걸어다니기 ━━━ */
  const WANDER_SIZE = 56;
  const WANDER_SIZE_H = 72;
  const WANDER_PAD = 16;
  const WANDER_TOP = 108;
  let wanderX = 0;
  let wanderY = 0;
  let wanderRaf = null;
  let wanderPerchTimer = null;
  let wanderEnabled = false;

  function wanderBounds(){
    return {
      minX: WANDER_PAD,
      minY: WANDER_TOP,
      maxX: Math.max(WANDER_PAD, window.innerWidth - WANDER_SIZE - WANDER_PAD),
      maxY: Math.max(WANDER_TOP, window.innerHeight - WANDER_SIZE_H - WANDER_PAD)
    };
  }

  function clampWander(x, y){
    const b = wanderBounds();
    return {
      x: Math.min(b.maxX, Math.max(b.minX, x)),
      y: Math.min(b.maxY, Math.max(b.minY, y))
    };
  }

  function setWanderPos(x, y){
    const c = clampWander(x, y);
    wanderX = c.x;
    wanderY = c.y;
    if(!chatWander) return;
    chatWander.style.left = wanderX + 'px';
    chatWander.style.top = wanderY + 'px';
  }

  function randomWanderPoint(){
    const b = wanderBounds();
    return {
      x: b.minX + Math.random() * (b.maxX - b.minX),
      y: b.minY + Math.random() * (b.maxY - b.minY)
    };
  }

  function stopWanderMotion(){
    if(wanderRaf){
      cancelAnimationFrame(wanderRaf);
      wanderRaf = null;
    }
    if(wanderPerchTimer){
      clearTimeout(wanderPerchTimer);
      wanderPerchTimer = null;
    }
    if(chatWander){
      chatWander.classList.remove('is-walking', 'is-idle');
    }
  }

  function setChefFacing(tx, sx){
    const facing = tx >= sx ? '1' : '-1';
    if(chatWander) chatWander.style.setProperty('--chef-facing', facing);
  }

  function idleWander(){
    if(!wanderEnabled || chatRoot.classList.contains('is-open')) return;
    if(chatWander) chatWander.classList.add('is-idle');
    const wait = 2200 + Math.random() * 4800;
    wanderPerchTimer = setTimeout(() => {
      wanderPerchTimer = null;
      if(!wanderEnabled || chatRoot.classList.contains('is-open')) return;
      const dest = randomWanderPoint();
      walkWanderTo(dest.x, dest.y);
    }, wait);
  }

  function walkWanderTo(tx, ty){
    if(!wanderEnabled || chatRoot.classList.contains('is-open')) return;
    stopWanderMotion();
    if(chatWander) chatWander.classList.add('is-walking');

    const sx = wanderX;
    const sy = wanderY;
    setChefFacing(tx, sx);
    const dist = Math.hypot(tx - sx, ty - sy);
    const duration = Math.min(6000, Math.max(1600, dist * 12));
    const start = performance.now();

    function easeInOut(t){
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function frame(now){
      if(!wanderEnabled || chatRoot.classList.contains('is-open')){
        stopWanderMotion();
        return;
      }
      const t = Math.min(1, (now - start) / duration);
      const e = easeInOut(t);
      const baseX = sx + (tx - sx) * e;
      const baseY = sy + (ty - sy) * e;
      const bob = Math.abs(Math.sin(now * 0.028)) * 2;
      setWanderPos(baseX, baseY - bob);
      if(t < 1){
        wanderRaf = requestAnimationFrame(frame);
      }else{
        wanderRaf = null;
        setWanderPos(tx, ty);
        if(chatWander) chatWander.classList.remove('is-walking');
        idleWander();
      }
    }
    wanderRaf = requestAnimationFrame(frame);
  }

  function anchorWander(){
    stopWanderMotion();
    if(!chatWander) return;
    chatWander.classList.add('is-anchored');
    chatWander.style.left = '';
    chatWander.style.top = '';
  }

  function releaseWander(){
    if(!chatWander || !wanderEnabled) return;
    chatWander.classList.remove('is-anchored');
    setWanderPos(wanderX, wanderY);
    idleWander();
  }

  function initMinimiWander(){
    if(!chatWander || !chatLauncher) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced){
      anchorWander();
      return;
    }
    wanderEnabled = true;
    const b = wanderBounds();
    setWanderPos(b.maxX, b.maxY);
    setChefFacing(b.minX, b.maxX);
    if(chatWander) chatWander.classList.add('is-idle');
    wanderPerchTimer = setTimeout(() => {
      wanderPerchTimer = null;
      walkWanderTo(
        b.minX + Math.random() * (b.maxX - b.minX) * 0.55,
        b.minY + Math.random() * (b.maxY - b.minY) * 0.5
      );
    }, 1600);

    window.addEventListener('resize', () => {
      if(chatRoot.classList.contains('is-open')) return;
      setWanderPos(wanderX, wanderY);
    });
  }

  function setChatOpen(open){
    chatRoot.classList.toggle('is-open', open);
    chatLauncher.setAttribute('aria-expanded', String(open));
    chatPanel.setAttribute('aria-hidden', String(!open));
    if(open){
      anchorWander();
      chatInput.focus();
      pollForReplies();
      if(pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(pollForReplies, 2500);
    } else {
      if(pollTimer){
        clearInterval(pollTimer);
        pollTimer = null;
      }
      if(wanderEnabled) releaseWander();
    }
  }

  chatLauncher.addEventListener('click', () => {
    setChatOpen(!chatRoot.classList.contains('is-open'));
  });
  chatClose.addEventListener('click', () => setChatOpen(false));

  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = chatInput.value;
    chatInput.value = '';
    handleUserMessage(text);
  });

  if(adminToggle && adminPanel){
    adminToggle.addEventListener('click', () => {
      adminPanel.classList.add('is-open');
      adminPanel.setAttribute('aria-hidden', 'false');
      renderAdmin();
    });
    adminClose.addEventListener('click', () => {
      adminPanel.classList.remove('is-open');
      adminPanel.setAttribute('aria-hidden', 'true');
    });
    adminPanel.addEventListener('click', e => {
      if(e.target === adminPanel){
        adminPanel.classList.remove('is-open');
        adminPanel.setAttribute('aria-hidden', 'true');
      }
    });
  }

  document.addEventListener('keydown', e => {
    if(e.key !== 'Escape') return;
    if(workModal?.classList.contains('open')) return;
    if(adminPanel?.classList.contains('is-open')){
      adminPanel.classList.remove('is-open');
      adminPanel.setAttribute('aria-hidden', 'true');
      return;
    }
    if(chatRoot.classList.contains('is-open')){
      setChatOpen(false);
    }
  });

  renderChips();
  renderMessages();
  updateAdminBadge();
  initMinimiWander();
})();
