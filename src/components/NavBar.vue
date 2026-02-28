<script setup lang="ts">
const links = [
  {
    href: 'https://github.com/Panzer-Jack/pick-alpha',
    icon: 'i-carbon-logo-github',
    // label: 'GitHub',
  },
  {
    href: 'https://blog.panzer-jack.cn/posts/learning-webgal-1',
    icon: 'i-carbon-blog',
    label: 'How it works',
  },
]
</script>

<template>
  <nav class="fixed top-0 left-0 w-full z-10 flex items-center justify-between px-24px md:px-32px h-52px md:h-44px bg-#0a0a0a/80 backdrop-blur-8px border-b border-white/8">
    <span class="text-white text-20px md:text-14px font-bold tracking-wide">
      Pick Alpha
    </span>

    <div class="flex items-center gap-16px md:gap-12px">
      <a
        v-for="link in links"
        :key="link.href"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-6px md:gap-4px text-gray-400 hover:text-white transition-colors"
      >
        <div
          :class="link.icon"
          class="text-22px md:text-16px"
        />
        <span class="text-18px md:text-12px">{{ link.label }}</span>
      </a>
    </div>
  </nav>
</template>
