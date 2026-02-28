import type { Ref } from 'vue'
import fsSource from '@/assets/shader/fs.glsl?raw'
import vsSource from '@/assets/shader/vs.glsl?raw'
import { createFullscreenQuad, createImageTexture, createProgram } from '@/utils/webgl'

export function usePickAlpha(canvas: Ref<HTMLCanvasElement | undefined>) {
  const pickColor = ref<[number, number, number]>([0, 0, 0])
  const tolerance = ref(0.3)
  const hasImage = ref(false)
  const displayColor = computed(() => {
    const [r, g, b] = pickColor.value
    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
  })

  let gl: WebGL2RenderingContext | null = null
  let program: WebGLProgram | null = null
  let vao: WebGLVertexArrayObject | null = null
  let texture: WebGLTexture | null = null
  let imageData: ImageData | null = null

  function init() {
    const el = canvas.value
    if (!el)
      return

    gl = el.getContext('webgl2', {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    })
    if (!gl)
      throw new Error('WebGL2 not supported')

    program = createProgram(gl, vsSource, fsSource)
    vao = createFullscreenQuad(gl, program)
  }

  function loadImage(image: HTMLImageElement) {
    if (!gl || !program)
      return

    const el = canvas.value!
    el.width = image.naturalWidth
    el.height = image.naturalHeight

    // 缓存原始像素数据，用于拾色
    const tmp = document.createElement('canvas')
    tmp.width = image.naturalWidth
    tmp.height = image.naturalHeight
    const ctx = tmp.getContext('2d')!
    ctx.drawImage(image, 0, 0)
    imageData = ctx.getImageData(0, 0, tmp.width, tmp.height)

    if (texture)
      gl.deleteTexture(texture)
    texture = createImageTexture(gl, image)
    hasImage.value = true
    render()
  }

  function render() {
    if (!gl || !program || !vao || !texture)
      return

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)
    gl.bindVertexArray(vao)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0)
    gl.uniform3fv(gl.getUniformLocation(program, 'u_pickColor'), pickColor.value)
    gl.uniform1f(gl.getUniformLocation(program, 'u_tolerance'), tolerance.value)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.bindVertexArray(null)
  }

  function handleCanvasClick(e: MouseEvent) {
    const el = canvas.value
    if (!el || !imageData)
      return

    const rect = el.getBoundingClientRect()
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * el.width)
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * el.height)
    const idx = (y * imageData.width + x) * 4

    pickColor.value = [
      imageData.data[idx] / 255,
      imageData.data[idx + 1] / 255,
      imageData.data[idx + 2] / 255,
    ]
    render()
  }

  function downloadResult() {
    const el = canvas.value
    if (!el)
      return

    render()
    const link = document.createElement('a')
    link.download = 'pick-alpha-result.png'
    link.href = el.toDataURL('image/png')
    link.click()
  }

  watch(tolerance, () => render())
  onMounted(() => init())

  return {
    pickColor,
    tolerance,
    hasImage,
    displayColor,
    loadImage,
    render,
    handleCanvasClick,
    downloadResult,
  }
}
