<template>
  <footer class="footer">
    <div class="footer-inner">
      <p>© {{ new Date().getFullYear() }} 个人博客 · 基于 Vue 3 + Vite 构建</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  padding: 1.5rem 1rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
</style>
