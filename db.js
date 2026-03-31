const DB = (() => {
  async function load() {
    const res = await fetch(`${CONFIG.SCRIPT_URL}?token=${CONFIG.TOKEN}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function save(items) {
    await fetch(`${CONFIG.SCRIPT_URL}?token=${CONFIG.TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(items),
    });
  }

  return { load, save };
})();
