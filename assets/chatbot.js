/* EasyFix Agent Chatbot v2.0 — Comprehensive FAQ + Multilingual, no API needed */
(function() {
  'use strict';

  /* ============ LANGUAGE DETECTION ============ */
  var LANG_PATTERNS = {
    ur: /[\u0600-\u06FF]/,
    hi: /[\u0900-\u097F]/,
    ar: /[\u0600-\u06FF]/,
    es: /\b(hola|gracias|por favor|qué|cuál|cómo|dónde|herramienta|gratis|mejor)\b/i,
    fr: /\b(bonjour|merci|s'il vous plaît|quel|quelle|comment|outil|gratuit|meilleur)\b/i,
    de: /\b(hallo|danke|bitte|welche|welcher|wie|wo|tool|kostenlos|beste)\b/i,
    pt: /\b(olá|obrigado|por favor|qual|como|onde|ferramenta|grátis|melhor)\b/i,
    tr: /\b(merhaba|teşekkür|ücretsiz|en iyi|araç|nasıl|nedir)\b/i,
    ru: /[\u0400-\u04FF]/,
    zh: /[\u4E00-\u9FFF]/
  };

  function detectLang(q) {
    for (var l in LANG_PATTERNS) {
      if (LANG_PATTERNS[l].test(q)) return l;
    }
    return 'en';
  }

  /* ============ MULTILINGUAL GREETINGS & FALLBACKS ============ */
  var I18N = {
    en: {
      greeting: 'Hi! 👋 I am the <b>EasyFix Agent</b> assistant. Ask me anything about <b>free AI tools</b> — video, images, voice, ChatGPT, coding, music, writing, students, and more!',
      fallback: 'Good question! I can help with <b>free AI tools</b> — try asking about <i>video generators</i>, <i>image generators</i>, <i>voice tools</i>, <i>ChatGPT tips</i>, <i>coding assistants</i>, <i>music generators</i>, or <i>writing tools</i>. Or browse all <a href="/">guides</a>.',
      thanks: 'You are welcome! 🙏 Happy to help. Anything else about AI tools?',
      chips: ['Best free AI tools?', 'Free AI video generators?', 'ChatGPT tips?', 'Free AI image tools?']
    },
    ur: {
      greeting: 'Assalam-o-Alaikum! 👋 Main <b>EasyFix Agent</b> assistant hun. <b>Muft AI tools</b> ke baare mein kuch bhi poochein — video, tasveer, awaz, ChatGPT, coding, music aur bohat kuch!',
      fallback: 'Acha sawal! Main <b>muft AI tools</b> mein madad kar sakta hun — <i>video generators</i>, <i>image generators</i>, <i>voice tools</i>, <i>ChatGPT tips</i>, ya <i>coding assistants</i> ke baare mein poochein. Ya tamam <a href="/">guides</a> dekhein.',
      thanks: 'Khush Aamdeed! 🙏 Madad karke khushi hui. AI tools ke baare mein aur kuch?',
      chips: ['Behtreen muft AI tools?', 'Muft AI video?', 'ChatGPT tips?', 'Muft AI images?']
    },
    hi: {
      greeting: 'Namaste! 👋 Main <b>EasyFix Agent</b> assistant hun. <b>Muft AI tools</b> ke baare mein kuch bhi poochein — video, image, voice, ChatGPT, coding, music aur bahut kuch!',
      fallback: 'Achha sawal! Main <b>muft AI tools</b> mein madad kar sakta hun — <i>video generators</i>, <i>image generators</i>, <i>voice tools</i>, ya <i>ChatGPT tips</i> ke baare mein poochein. Ya sabhi <a href="/">guides</a> dekhein.',
      thanks: 'Aapka swagat hai! 🙏 Madad karke khushi hui. AI tools ke baare mein aur kuch?',
      chips: ['Best muft AI tools?', 'Muft AI video?', 'ChatGPT tips?', 'Muft AI images?']
    },
    es: {
      greeting: '¡Hola! 👋 Soy el asistente de <b>EasyFix Agent</b>. Pregúntame sobre <b>herramientas de IA gratuitas</b> — video, imágenes, voz, ChatGPT, programación, música y más.',
      fallback: '¡Buena pregunta! Puedo ayudarte con <b>herramientas de IA gratuitas</b> — pregunta sobre <i>generadores de video</i>, <i>generadores de imágenes</i>, <i>voces IA</i>, o <i>consejos de ChatGPT</i>. O explora todas las <a href="/">guías</a>.',
      thanks: '¡De nada! 🙏 Un placer ayudar. ¿Algo más sobre herramientas de IA?',
      chips: ['¿Mejores IA gratis?', '¿Generadores de video?', '¿Trucos ChatGPT?', '¿Imágenes IA gratis?']
    },
    fr: {
      greeting: 'Bonjour! 👋 Je suis l\'assistant <b>EasyFix Agent</b>. Posez-moi vos questions sur les <b>outils IA gratuits</b> — vidéo, images, voix, ChatGPT, code, musique et plus.',
      fallback: 'Bonne question! Je peux vous aider avec les <b>outils IA gratuits</b> — demandez sur les <i>générateurs vidéo</i>, <i>générateurs d\'images</i>, <i>voix IA</i>, ou <i>astuces ChatGPT</i>. Ou parcourez tous les <a href="/">guides</a>.',
      thanks: 'De rien! 🙏 Ravi d\'aider. Autre chose sur les outils IA?',
      chips: ['Meilleurs IA gratuits?', 'Générateurs vidéo?', 'Astuces ChatGPT?', 'Images IA gratuites?']
    },
    de: {
      greeting: 'Hallo! 👋 Ich bin der <b>EasyFix Agent</b> Assistent. Fragen Sie mich zu <b>kostenlosen KI-Tools</b> — Video, Bilder, Sprache, ChatGPT, Coding, Musik und mehr.',
      fallback: 'Gute Frage! Ich helfe bei <b>kostenlosen KI-Tools</b> — fragen Sie nach <i>Video-Generatoren</i>, <i>Bild-Generatoren</i>, <i>KI-Stimmen</i>, oder <i>ChatGPT-Tipps</i>. Oder stöbern Sie in allen <a href="/">Anleitungen</a>.',
      thanks: 'Gerne! 🙏 Freut mich zu helfen. Noch etwas zu KI-Tools?',
      chips: ['Beste kostenlose KI?', 'Video-Generatoren?', 'ChatGPT-Tipps?', 'KI-Bilder kostenlos?']
    },
    ar: {
      greeting: 'مرحباً! 👋 أنا مساعد <b>EasyFix Agent</b>. اسألني عن <b>أدوات الذكاء الاصطناعي المجانية</b> — فيديو، صور، صوت، ChatGPT، برمجة، موسيقى والمزيد.',
      fallback: 'سؤال جيد! يمكنني المساعدة في <b>أدوات الذكاء الاصطناعي المجانية</b> — اسأل عن <i>مولدات الفيديو</i>، <i>مولدات الصور</i>، <i>الأصوات</i>، أو <i>نصائح ChatGPT</i>. أو تصفح جميع <a href="/">الأدلة</a>.',
      thanks: 'على الرحب والسعة! 🙏 سعيد بالمساعدة. أي شيء آخر عن أدوات الذكاء الاصطناعي؟',
      chips: ['أفضل أدوات مجانية؟', 'مولدات فيديو؟', 'نصائح ChatGPT؟', 'صور مجانية؟']
    }
  };

  function t(lang, key) {
    var pack = I18N[lang] || I18N.en;
    return pack[key] || I18N.en[key];
  }

  /* ============ COMPREHENSIVE KNOWLEDGE BASE ============ */
  /* Each entry: keywords (matched case-insensitive), answer in English.
     Language-specific answers appended where high-value. */
  var KNOWLEDGE = [
    /* ---- VIDEO ---- */
    { k: ['video generat', 'text to video', 'ai video', 'video ai', 'make video', 'video banan', 'vídeo', 'vidéo'],
      a: 'Best <b>free AI video generators</b>: <b>Luma Dream Machine</b> (free tier, great quality), <b>Haiper</b>, <b>Pika</b> (free credits), <b>CapCut AI</b> (free, easy). Full comparison: <a href="/blog/ai-video-generators-free.html">5 Free AI Video Generators</a>. Also see <a href="/blog/ai-video-editing-tools-free.html">Free AI Video Editing Tools</a>.' },
    { k: ['video edit', 'edit video', 'video editor'],
      a: 'Best <b>free AI video editors</b>: <b>CapCut</b> (auto-captions, effects, free), <b>DaVinci Resolve</b> (pro-grade, free), <b>Clipchamp</b> (browser-based). Guide: <a href="/blog/ai-video-editing-tools-free.html">Free AI Video Editing Tools</a>.' },

    /* ---- IMAGE ---- */
    { k: ['image generat', 'ai image', 'picture generat', 'photo generat', 'ai art', 'text to image', 'tasveer', 'छवि', 'imagen', 'bild gener'],
      a: 'Best <b>free AI image generators</b>: <b>Leonardo.ai</b> (~150 free images/day), <b>Bing Image Creator</b> (DALL-E 3, free), <b>Ideogram</b> (best text in images), <b>Stable Diffusion</b> (open source, unlimited). Full guide: <a href="/blog/ai-image-generators-compared.html">AI Image Generators Compared</a>.' },
    { k: ['photo edit', 'image edit', 'edit photo', 'background remov'],
      a: 'Best <b>free AI photo editors</b>: <b>Photopea</b> (free Photoshop alternative), <b>Canva</b> (AI background remover), <b>remove.bg</b> (free background removal). Guide: <a href="/blog/ai-photo-editors-free.html">Free AI Photo Editors</a>.' },

    /* ---- VOICE / AUDIO ---- */
    { k: ['voice generat', 'text to speech', 'tts', 'voiceover', 'ai voice', 'awaz', 'voz', 'voix', 'stimme'],
      a: 'Best <b>free AI voice generators</b>: <b>ElevenLabs</b> (10,000 chars/month free, most realistic), <b>TTSMaker</b>, <b>CapCut TTS</b> (free, many voices), <b>Microsoft Edge Read Aloud</b> (free). Guide: <a href="/blog/ai-voice-generators-free.html">Free AI Voice Generators</a>.' },
    { k: ['music generat', 'ai music', 'song generat', 'background music'],
      a: 'Best <b>free AI music generators</b>: <b>Suno</b> (free credits, full songs with vocals), <b>Udio</b>, <b>Beatoven.ai</b> (royalty-free background music). Guide: <a href="/blog/ai-music-generators-free.html">Free AI Music Generators</a>.' },

    /* ---- CHATGPT / CHATBOTS / PROMPTS ---- */
    { k: ['chatgpt', 'gpt-4', 'gpt4', 'prompt tip', 'prompting', 'chatbot'],
      a: 'Top <b>ChatGPT tips for beginners</b>: 1) Be specific in prompts 2) Give examples 3) Ask for step-by-step 4) Iterate and refine 5) Set a role ("act as a..."). Full tricks: <a href="/blog/chatgpt-tips-beginners.html">9 ChatGPT Tricks</a>. Also compare all chatbots: <a href="/blog/ai-chatbots-compared-2026.html">AI Chatbots Compared (2026)</a>.' },
    { k: ['chatbot compar', 'best chatbot', 'claude vs', 'gemini vs', 'which ai chatbot', 'ai assistant compar'],
      a: '<b>AI chatbots compared (2026)</b>: <b>ChatGPT</b> (best all-rounder), <b>Claude</b> (best writing/coding), <b>Gemini</b> (best Google integration), <b>Copilot</b> (best for Microsoft users). All have free tiers! Full comparison: <a href="/blog/ai-chatbots-compared-2026.html">AI Chatbots Compared</a>.' },
    { k: ['prompt engineer', 'write better prompt', 'prompt guide', 'prompt basic'],
      a: 'Learn <b>prompt engineering basics</b>: clear instructions, context, examples, constraints, and iteration. Beginner-friendly guide: <a href="/blog/prompt-engineering-basics.html">Prompt Engineering Basics</a>.' },

    /* ---- WRITING ---- */
    { k: ['writing tool', 'ai writ', 'essay', 'article writ', 'blog writ', 'content writ', 'likhna'],
      a: 'Best <b>free AI writing tools</b>: <b>ChatGPT</b> (drafts, ideas), <b>Claude</b> (long-form), <b>Grammarly</b> (grammar, free tier), <b>QuillBot</b> (paraphrasing). Guide: <a href="/blog/ai-writing-tools-free.html">Free AI Writing Tools</a>.' },

    /* ---- CODING ---- */
    { k: ['coding assist', 'code generat', 'ai code', 'programming help', 'copilot', 'code likh'],
      a: 'Best <b>free AI coding assistants</b>: <b>GitHub Copilot</b> (free for students/OSS), <b>ChatGPT</b> (debugging, explanations), <b>Claude</b> (complex code), <b>Tabnine</b> (free tier). Guide: <a href="/blog/ai-coding-assistants-free.html">Free AI Coding Assistants</a>.' },

    /* ---- STUDENTS / EDUCATION ---- */
    { k: ['student', 'study', 'homework', 'exam', 'learn', 'school', 'college', 'university', 'parhai'],
      a: 'Best <b>AI tools for students</b>: <b>ChatGPT</b> (explain concepts), <b>Notion AI</b> (notes), <b>Grammarly</b> (essays), <b>QuillBot</b> (paraphrase), <b>Otter.ai</b> (lecture notes). Guide: <a href="/blog/ai-tools-for-students.html">AI Tools for Students</a>.' },

    /* ---- BUSINESS / PRODUCTIVITY ---- */
    { k: ['business', 'small business', 'startup', 'freelance', 'entrepreneur', 'karobar'],
      a: 'Best <b>free AI tools for small business</b>: <b>ChatGPT</b> (content, emails), <b>Canva AI</b> (design, logos), <b>Notion AI</b> (docs, wikis), <b>HubSpot AI</b> (CRM, free). Full list: <a href="/blog/ai-tools-small-business.html">8 AI Tools for Small Business</a>.' },
    { k: ['productivity', 'save time', 'organize', 'task manage', 'to-do', 'efficient'],
      a: 'Best <b>AI productivity tools</b>: <b>Notion AI</b> (notes, docs), <b>Motion</b> (auto-scheduling), <b>Otter.ai</b> (meeting transcripts), <b>Grammarly</b> (writing). Guide: <a href="/blog/ai-productivity-tools.html">7 AI Productivity Tools</a>.' },

    /* ---- GENERAL / SITE INFO ---- */
    { k: ['best free ai', 'top ai tools', 'which ai tool', 'recommend ai', 'behtreen ai', 'mejor ia', 'meilleur ia'],
      a: 'Our <b>top free AI picks for 2026</b>: <b>ChatGPT</b> (chat/writing), <b>Leonardo.ai</b> (images), <b>ElevenLabs</b> free tier (voice), <b>CapCut</b> (video), <b>Suno</b> (music). Full tested list: <a href="/blog/best-free-ai-tools-2026.html">10 Best Free AI Tools (2026)</a>.' },
    { k: ['free', 'cost', 'price', 'paid', 'subscription', 'muft', 'gratis', 'gratuit', 'kostenlos'],
      a: 'Everything we recommend has a <b>genuinely free tier</b> — no credit card required. We personally test the free plans and only list tools actually worth your time. No sponsored placements, ever.' },
    { k: ['who are you', 'about', 'trust', 'reliable', 'founder', 'team', 'aap kaun', 'quién eres', 'qui êtes'],
      a: 'We are <b>EasyFix Agent</b> — founded by <b>Muhammad Mudassir Yaseen</b>. We hands-on test every AI tool before writing about it. No sponsored placements, ever. More: <a href="/about.html">About Us</a>.' },
    { k: ['contact', 'email', 'help', 'support', 'rabta', 'contacto'],
      a: 'Reach us anytime via the <a href="/contact.html">Contact page</a> or email <b>info@easyfixagent.space</b>. We read every message!' },
    { k: ['privacy', 'data', 'cookie'],
      a: 'Your privacy matters. We do not sell data. Details: <a href="/privacy.html">Privacy Policy</a> and <a href="/terms.html">Terms</a>.' },
    { k: ['newsletter', 'subscribe', 'updates', 'new article'],
      a: 'Use the <b>newsletter box</b> on our homepage to get new AI tool guides in your inbox. Or enable <b>push notifications</b> (bell icon) for instant updates!' },
    { k: ['notification', 'push', 'alert', 'bell'],
      a: 'Click <b>Allow</b> on the notification prompt (or the bell icon) to get instant alerts when we publish new AI tool guides!' },

    /* ---- GREETINGS ---- */
    { k: ['hello', 'hi', 'hey', 'salam', 'assalam', 'hola', 'bonjour', 'hallo', 'namaste', 'aoa', 'good morning', 'good evening'],
      a: '__GREETING__' },
    { k: ['thank', 'shukriya', 'shukria', 'dhanyavad', 'gracias', 'merci', 'danke', 'obrigado', 'great', 'awesome', 'nice', 'perfect', 'love'],
      a: '__THANKS__' },
    { k: ['bye', 'goodbye', 'khuda hafiz', 'allah hafiz', 'adios', 'au revoir', 'alvida'],
      a: '__BYE__' }
  ];

  var BYE_MSGS = {
    en: 'Goodbye! 👋 Come back anytime for free AI tool guides!',
    ur: 'Khuda Hafiz! 👋 Muft AI tools ke liye wapas zaroor aayein!',
    hi: 'Alvida! 👋 Muft AI tools ke liye vapas zaroor aayein!',
    es: '¡Adiós! 👋 ¡Vuelve cuando quieras por guías de IA gratis!',
    fr: 'Au revoir! 👋 Revenez pour nos guides IA gratuits!',
    de: 'Tschüss! 👋 Kommen Sie zurück für kostenlose KI-Guides!',
    ar: 'مع السلامة! 👋 عد في أي وقت لأدلة الذكاء الاصطناعي المجانية!'
  };

  function findAnswer(q, lang) {
    var ql = q.toLowerCase();
    for (var i = 0; i < KNOWLEDGE.length; i++) {
      var item = KNOWLEDGE[i];
      for (var j = 0; j < item.k.length; j++) {
        if (ql.indexOf(item.k[j]) !== -1) {
          var ans = item.a;
          if (ans === '__GREETING__') return t(lang, 'greeting');
          if (ans === '__THANKS__') return t(lang, 'thanks');
          if (ans === '__BYE__') return BYE_MSGS[lang] || BYE_MSGS.en;
          return ans;
        }
      }
    }
    return t(lang, 'fallback');
  }

  /* ============ UI ============ */
  function init() {
    var fab = document.createElement('button');
    fab.className = 'ef-chat-fab'; fab.innerHTML = '💬'; fab.setAttribute('aria-label', 'Chat with us');
    var panel = document.createElement('div');
    panel.className = 'ef-chat-panel';
    panel.innerHTML =
      '<div class="ef-chat-head"><div class="av">⚡</div><div><b>EasyFix Agent</b><span>Ask about free AI tools</span></div><button class="x" aria-label="Close">×</button></div>' +
      '<div class="ef-chat-msgs"></div>' +
      '<div class="ef-chips"></div>' +
      '<div class="ef-chat-input"><input type="text" placeholder="Ask in any language... 🌍" aria-label="Your question"><button>Send</button></div>';
    document.body.appendChild(fab); document.body.appendChild(panel);

    var msgs = panel.querySelector('.ef-chat-msgs');
    var chips = panel.querySelector('.ef-chips');
    var input = panel.querySelector('input');
    var sendBtn = panel.querySelector('.ef-chat-input button');
    var userLang = 'en';

    function addMsg(text, who) {
      var d = document.createElement('div');
      d.className = 'ef-msg ' + who; d.innerHTML = text;
      msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    }
    function botReply(q) {
      var lang = detectLang(q);
      if (lang !== 'en' || !/[\u0600-\u06FF\u0900-\u097F\u0400-\u04FF\u4E00-\u9FFF]/.test(q)) {
        // keep detected lang; default 'en' unless non-latin script detected
      }
      userLang = lang;
      setTimeout(function() { addMsg(findAnswer(q, lang), 'bot'); }, 450);
    }
    function renderChips() {
      chips.innerHTML = '';
      var list = t(userLang, 'chips');
      list.forEach(function(s) {
        var c = document.createElement('button');
        c.className = 'ef-chip'; c.textContent = s;
        c.onclick = function() { addMsg(s.replace(/</g, '&lt;'), 'user'); botReply(s); };
        chips.appendChild(c);
      });
    }
    renderChips();

    fab.onclick = function() {
      panel.classList.toggle('open');
      if (panel.classList.contains('open') && !msgs.children.length) {
        addMsg(t(userLang, 'greeting'), 'bot');
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
