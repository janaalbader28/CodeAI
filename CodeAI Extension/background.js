
  // ================= CONTEXT MENUS =================
chrome.runtime.onInstalled.addListener(() => {
  ["Explain", "Output", "Errors", "Improve"].forEach(item => {
    chrome.contextMenus.create({
      id: item.toLowerCase(),
      title: item,
      contexts: ["selection"]
    });
  });
});

// ================= CONTENT SCRIPT =================
async function ensureContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  } catch (err) {
    console.error("Failed to inject content script:", err);
  }
}

// ================= SETTINGS =================
function getDetailLevel() {
  return new Promise(resolve => {
    chrome.storage.sync.get(["detail"], ({ detail }) => {
      resolve(detail || "simple");
    });
  });
}

// ================= HISTORY (LOCAL) =================
async function saveHistoryEntry(entry) {
  const { codeai_history = [] } =
    await new Promise(res => chrome.storage.local.get(["codeai_history"], res));

  const MAX = 50;
  await chrome.storage.local.set({
    codeai_history: [entry, ...codeai_history].slice(0, MAX)
  });
}

// ================= ANALYTICS HELPERS =================
function detectLanguage(code) {
  if (/^\s*#include/m.test(code)) return "cpp";
  if (/System\.out\.println|public\s+class/m.test(code)) return "java";
  if (/console\.log|=>|function\s*\(/m.test(code)) return "javascript";
  if (/def\s+\w+|\bprint\(/m.test(code)) return "python";
  if (/<html|<!DOCTYPE/i.test(code)) return "html";
  return "other";
}

function detectErrorCategory(text) {
  const t = text.toLowerCase();
  if (/syntax|unexpected token|invalid/i.test(t)) return "syntax";
  if (/runtime|exception|crash/i.test(t)) return "runtime";
  if (/class|object|inheritance|polymorphism/i.test(t)) return "oop";
  if (/array|index|out of bounds|length/i.test(t)) return "array";
  if (/logic|wrong result|incorrect/i.test(t)) return "logic";
  if (/null|undefined|none/i.test(t)) return "null";
  if (/performance|slow|optimize|complexity/i.test(t)) return "performance";
  return "other";
}

// ================= LOCAL ANALYTICS =================
async function recordUsage(stat) {
  const { codeai_usage = [] } =
    await new Promise(res => chrome.storage.local.get(["codeai_usage"], res));

  // Default fallback for language & error
  stat.language = stat.language || "other";
  stat.errorCategory = stat.errorCategory || "other";

  codeai_usage.push(stat);
  await chrome.storage.local.set({ codeai_usage });
}

// ================= OPENAI CALL =================
async function fetchAIResponse(code, actionType, detailLevel) {
  const apiKey = "YOUR_API_KEY_HERE"; 
  let prompt = "";
  switch (actionType) {
    case "explain":
      prompt = detailLevel === "simple"
        ? `Briefly explain the goal of this code no more than 3 lines:\n${code}`
        : `Explain this code line by line:\n${code}`;
      break;
    case "output":
      prompt = `Give the output of this code:\n${code}`;
      break;
    case "errors":
      prompt = `Check this code for errors and explain them briefly, max of 3 lines no more:\n${code}`;
      break;
    case "improve":
      prompt = `
    Refactor this code briefly.

    Then output ONLY ONE of the following improvement categories
    that best fits your suggestion:

    - Code Structure & Readability
    - Error Handling & Edge Cases
    - Async & Concurrency
    - Performance & Optimization
    - Data Structures & Algorithms

    Format exactly like this:
    CATEGORY: <category name>
    SUGGESTION: <short explanation>

    Code:
    ${code}
    `;
      break;}

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        input: prompt
      })
    });


    const data = await res.json();
    console.log("OpenAI response raw:", data);

    if (data.error) {
      return ` OpenAI error: ${data.error.message}`;
    }

    if (Array.isArray(data.output)) {
      const pieces = [];
      data.output.forEach(outItem => {
        if (Array.isArray(outItem.content)) {
          outItem.content.forEach(block => {
            if (block.type === "output_text" && typeof block.text === "string") {
              pieces.push(block.text.trim());
            }
          });
        }
      });
      if (pieces.length > 0) return pieces.join("\n\n");
    }

    return "No response found.";
  } catch (err) {
    console.error(err);
    return "Error fetching AI response.";
  }
}
// ================= SAFE SEND =================
function safeSend(tabId, message) {
  chrome.tabs.sendMessage(tabId, message, () => {});
}

function extractImproveCategory(text) {
  const match = text.match(/CATEGORY:\s*(.+)/i);
  return match ? match[1].trim() : "Other";
}

// ================= CONTEXT MENU CLICK =================
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  const action = info.menuItemId;
  const code = info.selectionText?.trim();
  if (!code) return;

  await ensureContentScript(tab.id);
  safeSend(tab.id, { action: "openPanel" });

  const detail = await getDetailLevel();
  const result = await fetchAIResponse(code, action, detail);

  // Save history locally
  saveHistoryEntry({
    id: Date.now().toString(),
    action,
    code,
    result,
    time: Date.now()
  });

  // Record analytics locally
  recordUsage({
    action,
    language: detectLanguage(code),
    errorCategory: action === "errors" ? detectErrorCategory(result) : null,
    improvementCategory:
      action === "improve" ? extractImproveCategory(result) : null,
    time: Date.now()
  });


  safeSend(tab.id, {
    action: "showAIResult",
    content: result,
    tab: action
  });
});

// ================= ANALYTICS BRIDGE =================
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "GET_LOCAL_USAGE") {
    chrome.storage.local.get(["codeai_usage"], d => {
      sendResponse({ history: d.codeai_usage || [] });
    });
    return true;
  }

  if (msg.action === "CLEAR_LOCAL_USAGE") {
    chrome.storage.local.remove(["codeai_usage"], () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  sendResponse({ error: "Unknown action" });
  return false; 
});



