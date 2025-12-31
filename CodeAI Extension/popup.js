
chrome.storage.sync.get(['theme', 'detail'], ({ theme, detail }) => {
  if (theme === 'dark') document.body.classList.add('dark');
  document.getElementById("theme-select").value = theme || 'light';
  document.getElementById("detail-select").value = detail || 'simple';
});

document.getElementById("save-btn").onclick = () => {
  const theme = document.getElementById("theme-select").value;
  const detail = document.getElementById("detail-select").value;
  chrome.storage.sync.set({ theme, detail }, () => {
    const msg = document.getElementById("save-msg");
    msg.innerText = "Settings saved!";
    msg.style.color = "lightgreen";
    setTimeout(() => { msg.innerText = ""; }, 2000);
  });

  if (theme === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');
};

document.getElementById("theme-select").onchange = (e) => {
  if (e.target.value === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');
};

document.getElementById("go-btn").onclick = () => {
  const url = "https://codeai-v1.netlify.app/"; 
  chrome.tabs.create({ url });
};
