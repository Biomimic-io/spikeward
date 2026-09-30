(() => {
  document.documentElement.classList.add("js");

  const cfg = window.SPIKEWARD || {};
  const repo = cfg.REPO_URL || "#";
  const deploy = "https://deploy.workers.cloudflare.com/?url=" + encodeURIComponent(cfg.DEPLOY_URL || repo);
  document.querySelectorAll("[data-repo-link]").forEach((a) => { a.href = repo; });
  document.querySelectorAll("[data-deploy-link]").forEach((a) => {
    if (!cfg.DEPLOY_READY) return;
    a.href = deploy;
    a.hidden = false;
  });

  // Example decision card: show what Undo and Always allow would do.
  const toast = document.querySelector(".decision-toast");
  document.querySelectorAll("[data-undo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const allow = btn.textContent.trim() === "Always allow";
      toast.textContent = allow
        ? "Challenge removed. asn:14061 added to your never-block list."
        : "Challenge removed. The cluster can be judged again on the next spike.";
    });
  });
})();
