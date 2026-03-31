<template>
  <div class="article-content markdown-body" v-html="html"></div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import 'highlight.js/styles/tokyo-night-dark.min.css'

const props = defineProps({
  content: { type: String, default: '' },
})

const md = new MarkdownIt({
  html: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch {}
    }
    return hljs.highlightAuto(str).value
  },
})

// 为标题添加 id 以支持目录锚点
const defaultRender = md.renderer.rules.heading_open || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))
md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const next = tokens[idx + 1]
  const content = next?.content || ''
  const id = content.replace(/\s+/g, '-').toLowerCase().replace(/[^\w\-]/g, '')
  if (id) token.attrSet('id', id)
  return defaultRender(tokens, idx, options, env, self)
}

const html = computed(() => {
  if (!props.content) return ''
  return DOMPurify.sanitize(md.render(props.content))
})
</script>
