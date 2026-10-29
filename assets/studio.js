/* EasyFix Agent — built-in browser studio (v1)
   Runs entirely in the visitor's browser against free public AI engines
   (Gradio queue API). No Streamlit, no server, no sign-up.
   Engines: LTX-Video (text->video), Wan 2.2 (image->video), FLUX.1 (image). */
(function () {
  "use strict";
  var LTX = "https://lightricks-ltx-video-distilled.hf.space";
  var WAN = "https://upsampler-wan-2-2-14b-image-to-video.hf.space";
  var WANT2V = "https://upsampler-wan-2-2-14b-text-to-video.hf.space";
  var FLUX = "https://black-forest-labs-flux-1-schnell.hf.space";
  var WAN_NEG = "色调艳丽, 过曝, 静态, 细节模糊不清, 字幕, 风格, 作品, 画作, 画面, 静止, 整体发灰, 最差质量, 低质量, JPEG压缩残留, 丑陋的, 残缺的, 多余的手指, 画得不好的手部, 画得不好的脸部, 畸形的, 毁容的, 形态畸形的肢体, 手指融合, 静止不动的画面, 杂乱的背景, 三条腿, 背景人很多, 倒着走";

  function $(id) { return document.getElementById(id); }
  function hfToken() { var el = $("hfToken"); return el ? el.value.trim() : ""; }
  function authHeaders(h) { var t = hfToken(); if (t) h["Authorization"] = "Bearer " + t; return h; }
  function sessionHash() {
    var s = "";
    for (var i = 0; i < 16; i++) s += Math.floor(Math.random() * 16).toString(16);
    return s;
  }
  function friendlyError(raw) {
    var t = (raw || "").toString();
    if (/quota|ZeroGPU/i.test(t))
      return "The free engine's daily allowance is used up right now. This is the free limit — not a problem with this site. Please try again in a little while, or try the other studio tab.";
    if (/duration/i.test(t))
      return "That request was too heavy for the free engine. Try a shorter duration (2 seconds) and generate again.";
    if (/queue/i.test(t))
      return "The free engine's queue is full right now. Wait a minute and try again.";
    return "The free engine could not finish this one (" + t.slice(0, 140) + "). Please try again — a different wording often helps.";
  }

  /* Run one Gradio queue job; onStatus(text) receives progress updates. */
  function runQueue(host, fnIndex, data, onStatus) {
    var sh = sessionHash();
    onStatus("Sending your request to the free AI engine…");
    return fetch(host + "/gradio_api/queue/join", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ data: data, fn_index: fnIndex, session_hash: sh })
    }).then(function (r) {
      if (!r.ok) throw new Error("Engine did not accept the request (HTTP " + r.status + ")");
      return r.json();
    }).then(function () {
      onStatus("In the queue — the engine is working on it. Free engines can take 1–5 minutes…");
      return consumeStream(host, sh, onStatus);
    });
  }

  function consumeStream(host, sh, onStatus) {
    return fetch(host + "/gradio_api/queue/data?session_hash=" + sh, { headers: authHeaders({}) }).then(function (res) {
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = "";
      function pump() {
        return reader.read().then(function (chunk) {
          if (chunk.done) throw new Error("The engine closed the connection early. Please try again.");
          buffer += decoder.decode(chunk.value, { stream: true });
          var lines = buffer.split("\n");
          buffer = lines.pop();
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.indexOf("data:") !== 0) continue;
            var msg;
            try { msg = JSON.parse(line.slice(5)); } catch (e) { continue; }
            if (msg.msg === "estimation") {
              var pos = (msg.queue_size != null) ? msg.queue_size : null;
              onStatus(pos ? "In the queue — about " + pos + " job(s) ahead of you…" : "In the queue…");
            } else if (msg.msg === "process_starts" || msg.msg === "process_generating") {
              onStatus("Generating now — painting every frame…");
            } else if (msg.msg === "process_completed") {
              if (msg.success === false || (msg.output && msg.output.error)) {
                throw new Error((msg.output && msg.output.error) || "Generation failed");
              }
              return msg.output.data;
            } else if (msg.msg === "queue_full") {
              throw new Error("queue full");
            }
          }
          return pump();
        });
      }
      return pump();
    });
  }

  function uploadFile(host, fileOrBlob, name) {
    var fd = new FormData();
    fd.append("files", fileOrBlob, name || "image.png");
    return fetch(host + "/gradio_api/upload", { method: "POST", body: fd, headers: authHeaders({}) })
      .then(function (r) {
        if (!r.ok) throw new Error("Upload failed (HTTP " + r.status + ")");
        return r.json();
      })
      .then(function (paths) {
        if (!paths || !paths.length) throw new Error("Upload failed — the engine returned no file.");
        return paths[0];
      });
  }

  /* Find the first file object (video or image) inside engine output. */
  function findFile(data, host, exts) {
    var found = null;
    (function walk(node) {
      if (found || node == null) return;
      if (typeof node === "string") {
        for (var i = 0; i < exts.length; i++) {
          if (node.toLowerCase().indexOf(exts[i]) > -1 && node.indexOf("/") > -1) {
            found = { url: node.indexOf("http") === 0 ? node : host + "/gradio_api/file=" + node };
            return;
          }
        }
        return;
      }
      if (Array.isArray(node)) { for (var j = 0; j < node.length; j++) walk(node[j]); return; }
      if (typeof node === "object") {
        var cand = node.url || node.path;
        if (cand) {
          var low = cand.toLowerCase();
          for (var k = 0; k < exts.length; k++) {
            if (low.indexOf(exts[k]) > -1) {
              found = { url: node.url ? node.url : host + "/gradio_api/file=" + node.path };
              return;
            }
          }
        }
        for (var key in node) walk(node[key]);
      }
    })(data);
    return found;
  }

  function boost(prompt) {
    if ($("boost").checked) return prompt + ", cinematic lighting, smooth natural motion, highly detailed, photorealistic";
    return prompt;
  }

  function setBusy(btn, statusEl, busy, text) {
    btn.disabled = busy;
    btn.textContent = busy ? "⏳ Working…" : text;
    statusEl.parentElement.style.display = busy ? "block" : statusEl.parentElement.style.display;
  }
  var timer = null;
  function startTimer(el) {
    var t0 = Date.now();
    clearInterval(timer);
    timer = setInterval(function () {
      var s = Math.floor((Date.now() - t0) / 1000);
      el.dataset.base = el.dataset.base || "";
      el.textContent = el.dataset.base + " (" + s + "s)";
    }, 1000);
    return function () { clearInterval(timer); };
  }
  function statusSetter(el) {
    return function (text) { el.dataset.base = text; el.textContent = text; };
  }

  /* ---------- Text to Video (LTX) ---------- */
  $("t2vBtn").addEventListener("click", function () {
    var prompt = $("t2vPrompt").value.trim();
    var status = $("t2vStatus"), out = $("t2vResult"), btn = $("t2vBtn");
    if (!prompt) { status.textContent = "Please describe your video first — plain words are fine."; out.style.display = "block"; return; }
    var aspect = $("t2vAspect").value, dur = parseInt($("t2vDur").value, 10);
    var wh = aspect === "portrait" ? [432, 768] : [768, 432];
    var frames = dur === 5 ? 121 : dur === 3 ? 73 : 49;
    var data = [boost(prompt), "blurry, low quality, distorted, static, watermark, text",
      null, null, wh[1], wh[0], "text-to-video", dur, frames, 0, true, 3.0, false];
    out.style.display = "block";
    $("t2vVideoWrap").innerHTML = "";
    setBusy(btn, status, true, "🎬 Generate Video");
    var stop = startTimer(status);
    function render(resultData, host) {
      stop();
      var f = findFile(resultData, host, [".mp4", ".webm"]);
      if (!f) throw new Error("The engine finished but returned no video file.");
      status.textContent = "✅ Done! Your video is ready — press play, or download it below.";
      $("t2vVideoWrap").innerHTML =
        '<video controls playsinline src="' + f.url + '" style="width:100%;border-radius:14px;background:#000;"></video>' +
        '<p style="margin-top:12px;"><a class="btn btn-primary" href="' + f.url + '" download target="_blank" rel="noopener">⬇ Download Video</a></p>';
    }
    runQueue(LTX, 4, data, statusSetter(status)).then(function (resultData) {
      render(resultData, LTX);
    }).catch(function () {
      /* Backup engine: a second free pool (Wan 2.2 text-to-video) */
      statusSetter(status)("Main engine is busy — switching to the backup engine…");
      var wanData = [boost(prompt),
        aspect === "portrait" ? "9:16 (480x832)" : "16:9 (832x480)",
        4, NEG_CN, dur, 1, 1, 42, true];
      return runQueue(WANT2V, 0, wanData, statusSetter(status)).then(function (resultData) {
        render(resultData, WANT2V);
      });
    }).catch(function (e) {
      stop();
      status.textContent = "⚠️ " + friendlyError(e.message);
    }).then(function () { setBusy(btn, status, false, "🎬 Generate Video"); });
  });

  /* ---------- Image to Video (Wan) + optional FLUX still ---------- */
  var chosenImage = null; // {blob|file, url}
  $("i2vFile").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    chosenImage = { blob: f, url: URL.createObjectURL(f), name: f.name };
    $("i2vPreview").src = chosenImage.url;
    $("i2vPreview").style.display = "block";
    $("i2vImgStatus").textContent = "Image selected: " + f.name;
  });

  $("fluxBtn").addEventListener("click", function () {
    var prompt = $("fluxPrompt").value.trim();
    var status = $("i2vImgStatus"), btn = $("fluxBtn");
    if (!prompt) { status.textContent = "Describe the picture you want first."; return; }
    var portrait = $("t2vAspect").value === "portrait";
    var wh = portrait ? [576, 1024] : [1024, 576];
    btn.disabled = true; btn.textContent = "⏳ Painting…";
    runQueue(FLUX, 2, [prompt + ", photorealistic, cinematic", 0, true, wh[0], wh[1], 4], function (t) { status.textContent = t; })
      .then(function (resultData) {
        var f = findFile(resultData, FLUX, [".png", ".jpg", ".jpeg", ".webp"]);
        if (!f) throw new Error("The painter finished but returned no image.");
        return fetch(f.url).then(function (r) { return r.blob(); }).then(function (blob) {
          chosenImage = { blob: blob, url: URL.createObjectURL(blob), name: "ai-image.png", remoteUrl: f.url };
          $("i2vPreview").src = chosenImage.url;
          $("i2vPreview").style.display = "block";
          status.textContent = "✅ Picture ready — now press “Animate This Image”.";
        });
      })
      .catch(function (e) { status.textContent = "⚠️ " + friendlyError(e.message); })
      .then(function () { btn.disabled = false; btn.textContent = "✨ Create My Starting Image with AI"; });
  });

  $("i2vBtn").addEventListener("click", function () {
    var prompt = $("i2vPrompt").value.trim() || "make this image come alive, cinematic motion, smooth animation";
    var status = $("i2vStatus"), out = $("i2vResult"), btn = $("i2vBtn");
    if (!chosenImage) { out.style.display = "block"; status.textContent = "Please choose an image first — upload one, or create one with AI above."; return; }
    out.style.display = "block";
    $("i2vVideoWrap").innerHTML = "";
    setBusy(btn, status, true, "🎞️ Animate This Image");
    var stop = startTimer(status);
    var setS = statusSetter(status);
    setS("Uploading your image to the video engine…");
    uploadFile(WAN, chosenImage.blob, chosenImage.name || "image.png")
      .then(function (path) {
        var data = [{ path: path }, boost(prompt), 8, WAN_NEG, 2, 1, 1, 42, true, null];
        return runQueue(WAN, 0, data, setS);
      })
      .then(function (resultData) {
        stop();
        var f = findFile(resultData, WAN, [".mp4", ".webm"]);
        if (!f) throw new Error("The engine finished but returned no video file.");
        status.textContent = "✅ Done! Your animated video is ready.";
        $("i2vVideoWrap").innerHTML =
          '<video controls playsinline src="' + f.url + '" style="width:100%;border-radius:14px;background:#000;"></video>' +
          '<p style="margin-top:12px;"><a class="btn btn-primary" href="' + f.url + '" download target="_blank" rel="noopener">⬇ Download Video</a></p>';
      })
      .catch(function (e) {
        stop();
        status.textContent = "⚠️ " + friendlyError(e.message);
      })
      .then(function () { setBusy(btn, status, false, "🎞️ Animate This Image"); });
  });

  /* ---------- Tabs + idea chips ---------- */
  function switchTab(which) {
    $("tabT2v").classList.toggle("active", which === "t2v");
    $("tabI2v").classList.toggle("active", which === "i2v");
    $("panelT2v").style.display = which === "t2v" ? "block" : "none";
    $("panelI2v").style.display = which === "i2v" ? "block" : "none";
  }
  $("tabT2v").addEventListener("click", function () { switchTab("t2v"); });
  $("tabI2v").addEventListener("click", function () { switchTab("i2v"); });
  var chips = document.querySelectorAll(".idea-chip");
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener("click", function () {
      $("t2vPrompt").value = this.getAttribute("data-prompt");
      switchTab("t2v");
      $("t2vPrompt").focus();
    });
  }
  /* ---------- Hugging Face token (visitor's own, browser-only) ---------- */
  var tokEl = $("hfToken");
  if (tokEl) {
    try { tokEl.value = localStorage.getItem("efa_hf_token") || ""; } catch (e) {}
    var updTok = function () {
      try { localStorage.setItem("efa_hf_token", tokEl.value.trim()); } catch (e) {}
      var st = $("tokenState");
      if (st) st.textContent = tokEl.value.trim() ? "✓ Token saved in this browser — your own allowance will be used." : "";
    };
    tokEl.addEventListener("change", updTok);
    tokEl.addEventListener("input", updTok);
    updTok();
  }
})();
