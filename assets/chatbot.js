/* EasyFix Agent Chatbot — FAQ-based, no API needed */
(function() {
  var KNOWLEDGE = [
    { k: ['best free ai', 'top ai tools', 'which ai tool', 'recommend ai'],
      a: 'Here are our top free picks: <b>ChatGPT</b> (writing/chat), <b>Leonardo.ai</b> (images), <b>ElevenLabs free tier</b> (voice), <b>CapCut</b> (video editing). Full list: <a href="/blog/best-free-ai-tools-2026.html">10 Best Free AI Tools (2026)</a>' },
    { k: ['video', 'ai video', 'text to video'],
      a: 'For free AI video, try <b>Luma Dream Machine</b> (free tier), <b>Haiper</b>, or <b>CapCut AI</b>. Read our comparison: <a href="/blog/ai-video-generators-free.html">5 Free AI Video Generators</a>' },
    { k: ['image', 'picture', 'photo', 'ai art', 'midjourney free'],
      a: 'Best free image generators: <b>Leonardo.ai</b> (150 free/day), <b>Bing Image Creator</b> (DALL-E 3 free), <b>Ideogram</b> (great text in images). Full guide: <a href="/blog/ai-image-generators-compared.html">AI Image Generators Compared</a>' },
    { k: ['voice', 'tts', 'text to speech', 'voiceover'],
      a: 'Best free AI voices: <b>ElevenLabs</b> (10k chars/month free), <b>TTSMaker</b>, <b>CapCut TTS</b>. Guide: <a href="/blog/ai-voice-generators-free.html">Free AI Voice Generators</a>' },
    { k: ['chatgpt', 'prompt', 'prompting'],
      a: 'Top ChatGPT beginner tips: be specific, give examples, ask for step-by-step, and iterate! Full tricks: <a href="/blog/chatgpt-tips-beginners.html">9 ChatGPT Tricks</a> and <a href="/blog/prompt-engineering-basics.html">Prompt Engineering Basics</a>' },
    { k: ['business', 'small business', 'startup', 'freelance'],
      a: 'Best free AI tools for small business: <b>ChatGPT</b> (content), <b>Canva AI</b> (design), <b>Notion AI</b> (docs), <b>Trello+AI</b> (tasks). Full list: <a href="/blog/ai-tools-small-business.html">8 AI Tools for Small Business</a>' },
    { k: ['productivity', 'save time', 'organize'],
      a: 'Our favorite productivity picks: <b>Notion AI</b>, <b>Grammarly</b>, <b>Otter.ai</b> (meeting notes). Guide: <a href="/blog/ai-productivity-tools.html">7 AI Productivity Tools</a>' },
    { k: ['free', 'cost', 'price', 'paid', 'subscription'],
      a: 'Everything we recommend has a <b>genuinely free tier</b> — no credit card needed. We test the free plans ourselves and only list tools worth your time!' },
    { k: ['who', 'about', 'trust', 'reliable'],
      a: 'We are <b>EasyFix Agent</b> — we hands-on test every AI tool before writing about it. No sponsored placements, ever. More: <a href="/about.html">About Us</a>' },
    { k: ['contact', 'email', 'help', 'support'],
      a: 'You can reach us via the <a href="/contact.html">Contact page</a>. We read every message!' },
    { k: ['hi', 'hello', 'hey', 'salam', 'assalam'],
      a: 'Hello! 👋 Ask me about <b>free AI tools</b> — video, image, voice, ChatGPT tips, productivity, or business tools. What are you looking for?' },
    { k: ['thank', 'shukriya', 'great', 'awesome', 'nice'],
      a: 'You are welcome! 🙏 Happy to help. Anything else about AI tools?' }
  ];
  var FALLBACK = 'Good question! I can help with <b>free AI tools</b> — try asking about <i>video generators</i>, <i>image generators</i>, <i>voice tools</i>, <i>ChatGPT tips</i>, or <i>productivity tools</i>. Or browse all <a href="/">guides</a>.';

  function findAnswer(q) {
    q = q.toLowerCase();
    for (var i = 0; i < KNOWLEDGE.length; i++) {
      var item = KNOWLEDGE[i];
      for (var j = 0; j < item.k.length; j++) {
        if (q.indexOf(item.k[j]) !== -1) return item.a;
      }
    }
    return FALLBACK;
  }

  function init() {
    // Build DOM
    var fab = document.createElement('button');
    fab.className = 'ef-chat-fab'; fab.innerHTML = '💬'; fab.setAttribute('aria-label', 'Chat with us');
    var panel = document.createElement('div');
    panel.className = 'ef-chat-panel';
    panel.innerHTML =
      '<div class="ef-chat-head"><div class="av">⚡</div><div><b>EasyFix Agent</b><span>Ask about free AI tools</span></div><button class="x" aria-label="Close">×</button></div>' +
      '<div class="ef-chat-msgs"></div>' +
      '<div class="ef-chips"></div>' +
      '<div class="ef-chat-input"><input type="text" placeholder="Ask about AI tools..." aria-label="Your question"><button>Send</button></div>';
    document.body.appendChild(fab); document.body.appendChild(panel);

    var msgs = panel.querySelector('.ef-chat-msgs');
    var chips = panel.querySelector('.ef-chips');
    var input = panel.querySelector('input');
    var sendBtn = panel.querySelector('.ef-chat-input button');

    function addMsg(text, who) {
      var d = document.createElement('div');
      d.className = 'ef-msg ' + who; d.innerHTML = text;
      msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    }
    function botReply(q) {
      setTimeout(function() { addMsg(findAnswer(q), 'bot'); }, 450);
    }
    var SUGGESTIONS = ['Best free AI tools?', 'Free AI video generators?', 'ChatGPT tips?', 'Free voice generators?'];
    SUGGESTIONS.forEach(function(s) {
      var c = document.createElement('button');
      c.className = 'ef-chip'; c.textContent = s;
      c.onclick = function() { addMsg(s, 'user'); botReply(s); };
      chips.appendChild(c);
    });

    fab.onclick = function() {
      panel.classList.toggle('open');
      if (panel.classList.contains('open') && !msgs.children.length) {
        addMsg('Hi! 👋 I am the <b>EasyFix Agent</b> assistant. Ask me anything about <b>free AI tools</b>!', 'bot');
      }
    };
    panel.querySelector('.x').onclick = function() { panel.classList.remove('open'); };
    function send() {
      var v = input.value.trim();
      if (!v) return;
      addMsg(v.replace(/</g, '&lt;'), 'user');
      input.value = ''; botReply(v);
    }
    sendBtn.onclick = send;
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') send(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
