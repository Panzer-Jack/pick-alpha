<script setup lang="ts">
import { usePickAlpha } from '@/composables/usePickAlpha'

const canvasRef = useTemplateRef('canvasRef')
const fileInputRef = useTemplateRef('fileInputRef')
const isDragging = ref(false)

const {
  pickColor,
  tolerance,
  hasImage,
  displayColor,
  loadImage,
  handleCanvasClick,
  downloadResult,
} = usePickAlpha(canvasRef as Ref<HTMLCanvasElement | undefined>)

function handleFile(file: File) {
  if (!file.type.startsWith('image/'))
    return
  const img = new Image()
  img.onload = () => {
    loadImage(img)
    URL.revokeObjectURL(img.src)
  }
  img.src = URL.createObjectURL(file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file)
    handleFile(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file)
    handleFile(file)
}

const pickColorHex = computed(() => {
  const [r, g, b] = pickColor.value
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
})
</script>

<template>
  <div class="text-white flex flex-col items-center px-20px md:px-32px py-30px">
    <!-- 标题 -->
    <h1 class="text-36px md:text-28px font-bold mb-6px tracking-wide">
      Pick Alpha
    </h1>
    <p class="text-gray-400 text-20px md:text-13px mb-28px">
      点击图片拾取颜色 → 该颜色区域变为透明
    </p>

    <!-- 控制栏 -->
    <div class="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-16px md:gap-12px mb-20px w-full max-w-700px md:max-w-720px">
      <!-- 第一行：上传 + 颜色信息 -->
      <div class="flex items-center gap-16px md:gap-12px">
        <button
          class="h-52px md:h-30px px-24px md:px-12px bg-#1e90ff hover:bg-#1a7ae0 rounded-6px md:rounded-4px text-24px md:text-12px cursor-pointer transition-colors whitespace-nowrap"
          @click="(fileInputRef as HTMLInputElement)?.click()"
        >
          上传图片
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileChange"
        >

        <!-- 拾取颜色展示 -->
        <div
          v-if="hasImage"
          class="flex items-center gap-10px md:gap-6px"
        >
          <span class="text-20px md:text-12px text-gray-400">拾取颜色:</span>
          <div
            class="w-32px md:w-20px h-32px md:h-20px rounded-4px border border-gray-600"
            :style="{ backgroundColor: displayColor }"
          />
          <span class="text-18px md:text-11px font-mono text-gray-300">{{ pickColorHex }}</span>
        </div>
      </div>

      <!-- 第二行：容差 + 下载 -->
      <div
        v-if="hasImage"
        class="flex items-center gap-16px md:gap-12px md:ml-auto"
      >
        <div class="flex items-center gap-10px md:gap-6px flex-1 md:flex-none">
          <span class="text-20px md:text-12px text-gray-400 whitespace-nowrap">容差:</span>
          <input
            v-model.number="tolerance"
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="flex-1 md:w-100px accent-#1e90ff"
          >
          <span class="text-18px md:text-11px font-mono text-gray-300 w-50px md:w-32px">
            {{ tolerance.toFixed(2) }}
          </span>
        </div>

        <button
          class="h-52px md:h-30px px-24px md:px-12px bg-#2ecc71 hover:bg-#27ae60 rounded-6px md:rounded-4px text-24px md:text-12px cursor-pointer transition-colors whitespace-nowrap"
          @click="downloadResult"
        >
          下载 PNG
        </button>
      </div>
    </div>

    <!-- Canvas 区域 -->
    <div
      class="relative w-full max-w-700px md:max-w-720px flex items-center justify-center rounded-10px md:rounded-6px overflow-hidden border-2 border-dashed transition-colors"
      :class="isDragging ? 'border-#1e90ff bg-#1e90ff/10' : 'border-gray-700'"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="onDrop"
    >
      <!-- 上传提示 -->
      <div
        v-if="!hasImage"
        class="flex flex-col items-center justify-center py-160px md:py-100px text-gray-500 cursor-pointer select-none"
        @click="(fileInputRef as HTMLInputElement)?.click()"
      >
        <div class="i-carbon-image text-64px md:text-40px mb-16px md:mb-10px" />
        <p class="text-24px md:text-14px">
          拖拽图片到此处，或点击上传
        </p>
      </div>

      <!-- WebGL Canvas -->
      <canvas
        v-show="hasImage"
        ref="canvasRef"
        class="checkerboard max-w-full max-h-70vh cursor-crosshair"
        @click="handleCanvasClick"
      />
    </div>
  </div>
</template>

<style scoped>
.checkerboard {
  background-image:
    linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%);
  background-size: 16px 16px;
  background-position:
    0 0,
    0 8px,
    8px -8px,
    -8px 0;
}
</style>
