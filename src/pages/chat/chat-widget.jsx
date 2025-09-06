// chat-widget.js
(function () {
  const root = document.getElementById("pharma-chat");
  if (!root) return;

  const API_BASE = root.dataset.apiBase;
  let TOKEN = root.dataset.token || "";
  let CONV_ID = root.dataset.conversationId || "";

  // Simple styles inside shadow DOM to avoid collisions
  const shadow = root.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    *{box-sizing:border-box} .pc-card{border:1px solid #e5e7eb;border-radius:16px;background:#fff}
    .pc-btn{padding:.5rem .75rem;border-radius:10px;border:1px solid #e5e7eb;background:#fff;cursor:pointer}
    .pc-btn.primary{background:#2563eb;color:#fff;border-color:#2563eb}
    .pc-input{width:100%;padding:.5rem .75rem;border:1px solid #e5e7eb;border-radius:12px}
    .pc-list{max-height:70vh;overflow:auto}
    .pc-row{padding:.5rem .75rem;border:1px solid #e5e7eb;border-radius:12px;background:#fff;margin:.25rem 0}
    .pc-row.me{background:#2563eb;color:#fff;text-align:right}
    .pc-muted{color:#6b7280;font-size:.85em}
    .pc-bar{display:flex;gap:.5rem;align-items:center}
    .pc-flex{display:flex;gap:.75rem}
  `;
  shadow.appendChild(style);

  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="pc-card" style="padding:12px;">
      <div class="pc-flex" style="justify-content:space-between;align-items:center;">
        <div>
          <div id="pc-title" style="font-weight:600;">Chat</div>
          <div id="pc-participants" class="pc-muted"></div>
        </div>
        <div class="pc-flex">
          <button id="pc-new" class="pc-btn">New</button>
          <button id="pc-refresh" class="pc-btn">Refresh</button>
        </div>
      </div>
      <div id="pc-convs" class="pc-list" style="margin-top:8px; display:none;"></div>

      <div id="pc-chat" style="display:none; margin-top:8px;">
        <div id="pc-messages" class="pc-list" style="border:1px solid #e5e7eb;border-radius:12px;padding:8px;background:#f9fafb;"></div>
        <div class="pc-bar" style="margin-top:8px;">
          <textarea id="pc-text" class="pc-input" rows="1" placeholder="Type a message…"></textarea>
          <button id="pc-send" class="pc-btn primary">Send</button>
        </div>
      </div>

      <div id="pc-create" style="display:none;margin-top:8px;">
        <input id="pc-subject" class="pc-input" placeholder="Subject (optional)" />
        <input id="pc-part-ids" class="pc-input" placeholder="Participant IDs (comma separated)" style="margin-top:6px;" />
        <textarea id="pc-first" class="pc-input" rows="2" placeholder="First message (optional)" style="margin-top:6px;"></textarea>
        <div style="text-align:right;margin-top:6px;">
          <button id="pc-create-btn" class="pc-btn primary">Create Conversation</button>
        </div>
      </div>

      <div id="pc-error" class="pc-muted" style="color:#b91c1c;margin-top:6px;"></div>
    </div>
  `;
  shadow.appendChild(wrap);

  const $ = (id) => shadow.getElementById(id);
  const $err = $("pc-error");

  const setError = (msg) => {
    $err.textContent = msg || "";
  };
  const authHeaders = () => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
  });

  async function api(path, opts = {}) {
    const url = new URL(API_BASE + path);
    if (opts.params)
      Object.entries(opts.params).forEach(([k, v]) =>
        url.searchParams.set(k, v)
      );
    const res = await fetch(url, {
      method: opts.method || "GET",
      headers:
        opts.body instanceof FormData
          ? {
              Accept: "application/json",
              ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
            }
          : authHeaders(),
      body: opts.body
        ? opts.body instanceof FormData
          ? opts.body
          : JSON.stringify(opts.body)
        : undefined,
    });
    if (!res.ok)
      throw new Error(
        (await res.json().catch(() => null))?.message || `HTTP ${res.status}`
      );
    return res.json().catch(() => null);
  }

  /** UI State */
  function showList() {
    $("pc-convs").style.display = "";
    $("pc-chat").style.display = "none";
    $("pc-create").style.display = "none";
  }
  function showChat() {
    $("pc-convs").style.display = "none";
    $("pc-chat").style.display = "";
    $("pc-create").style.display = "none";
  }
  function showCreate() {
    $("pc-convs").style.display = "none";
    $("pc-chat").style.display = "none";
    $("pc-create").style.display = "";
  }

  /** Conversations list */
  async function loadConversations() {
    try {
      setError("");
      const data = await api("/conversations", { params: { per_page: 20 } });
      const rows = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      const box = $("pc-convs");
      box.innerHTML = "";
      if (!rows.length) {
        box.innerHTML = `<div class="pc-muted">No conversations.</div>`;
      } else {
        rows.forEach((c) => {
          const div = document.createElement("div");
          div.className = "pc-row";
          div.textContent = c.subject || `Conversation #${c.id}`;
          div.style.cursor = "pointer";
          div.onclick = () => openConversation(c.id);
          box.appendChild(div);
        });
      }
      showList();
    } catch (e) {
      setError(e.message);
    }
  }

  /** Chat view */
  async function openConversation(id) {
    try {
      setError("");
      CONV_ID = id;
      const data = await api(`/conversations/${id}`);
      const convo = data?.conversation || {};
      const paginator = data?.messages;
      $("pc-title").textContent = convo.subject || `Conversation #${id}`;
      $("pc-participants").textContent = (convo.users || [])
        .map((u) => u.name || u.email)
        .join(", ");
      renderMessages(paginator?.data || []);
      showChat();
      scrollToBottom();
    } catch (e) {
      setError(e.message);
    }
  }

  function renderMessages(list) {
    const box = $("pc-messages");
    box.innerHTML = "";
    // server returns latest first in the earlier code example; adjust if needed
    [...list].reverse().forEach((m) => {
      const bubble = document.createElement("div");
      bubble.className = "pc-row" + (m.user_id === 0 ? " me" : ""); // replace `0` with real user id if you render it
      bubble.innerHTML = `
        <div class="pc-muted">${
          m.user?.name || m.user?.email || `User #${m.user_id}`
        }</div>
        <div style="white-space:pre-wrap">${(m.body || "").replace(
          /[<>&]/g,
          (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])
        )}</div>
        ${
          m.attachment_path
            ? `<div><a href="${m.attachment_path}" target="_blank" rel="noreferrer" style="font-size:.85em;text-decoration:underline;">Attachment</a></div>`
            : ""
        }
      `;
      $("pc-messages").appendChild(bubble);
    });
  }

  function scrollToBottom() {
    const el = $("pc-messages");
    if (!el) return;
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 0);
  }

  async function sendMessage() {
    const text = $("pc-text").value.trim();
    if (!text || !CONV_ID) return;
    try {
      setError("");
      const msg = await api(`/conversations/${CONV_ID}/messages`, {
        method: "POST",
        body: { body: text },
      });
      $("pc-text").value = "";
      // append to bottom
      renderMessages([...(shadow.messagesCache || []), msg]);
      shadow.messagesCache = [msg, ...(shadow.messagesCache || [])];
      // Reload fresh (optional)
      openConversation(CONV_ID);
    } catch (e) {
      setError(e.message);
    }
  }

  /** Create new conversation */
  async function createConversation() {
    const subject = $("pc-subject").value.trim();
    const ids = $("pc-part-ids")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter(Number.isInteger);
    const first = $("pc-first").value.trim();
    try {
      setError("");
      const conv = await api("/conversations", {
        method: "POST",
        body: {
          subject: subject || null,
          participant_ids: ids,
          first_message: first || null,
        },
      });
      // jump into the new conversation
      await openConversation(conv.id);
    } catch (e) {
      setError(e.message);
    }
  }

  // Wire buttons
  $("pc-refresh").onclick = () => {
    if (CONV_ID) openConversation(CONV_ID);
    else loadConversations();
  };
  $("pc-new").onclick = () => showCreate();
  $("pc-send").onclick = sendMessage;
  $("pc-create-btn").onclick = createConversation;

  $("pc-text").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Initial screen
  if (CONV_ID) openConversation(CONV_ID);
  else loadConversations();
})();
