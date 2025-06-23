import { defineStore } from 'pinia'
import { useToastModal } from '@/composables/modals/useToastModal'
import { nextTick } from 'vue'
import { useConfirmModal } from '@/composables/modals/useConfirmModal'
import jsPDF from 'jspdf'
import { useMath } from '@/composables/common/useMath'

const { showToastModal } = useToastModal()
const { showConfirmModal } = useConfirmModal()

const isValidFileName = (name) => {
  // Invalid characters: \ / : * ? " < > |
  return !/[\\/:*?"<>|]/.test(name)
}

export const useImageStore = defineStore('imageStore', {
  state: () => ({
    file: null,
    fileType: '', // 'image' or 'pdf'
    fileSize: 0, // In bytes

    fileName: '',
    fileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'
    fileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    },

    // New values used for export
    newFileFormat: '', // 'png', 'jpg', 'jpeg', 'pdf'
    newFileName: '',
    newFileDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    },

    // Value for preview image in export tool
    previewUrl: '',
    // Value for original image
    originalImage: null,
    originalImageDimensions: {
      fileAspectRatio: 1,
      width: 0,
      height: 0,
      quality: 100,
    },

    // Value for raster image rendering
    renderedImage: null,
    // Value for SVG rendering
    // svgObjects: [],
    svgObjects: [
      {
        tag: 'rect',
        attrs: {
          x: 50,
          y: 40,
          width: 200,
          height: 100,
          fill: 'red',
          stroke: 'red',
        },
      },
      {
        tag: 'circle',
        attrs: {
          cx: 300,
          cy: 200,
          r: 50,
          fill: 'blue',
          stroke: 'black',
        },
      },
    ],
    selectedSvgObjectId: null,

    imageOperations: {
      effects: {
        brightness: 0, //  -100 - +100
        contrast: 0, //  -100 - +100
        saturation: 0,
        grayscale: false,
        invert: false,
      },
      transformations: {
        rotation: 0,
      },
    },
  }),
  actions: {
    isImageLoaded() {
      return this.fileName && this.fileName.trim() !== ''
    },

    setFileName(newName, t, isNewFileName = false) {
      // this.fileName = newName.trim()
      let trimmedName = newName.trim()

      // Empty name
      if (trimmedName === '') {
        if (this.file !== null) {
          showToastModal(
            'error',
            t('imageStore.toast.errorEmptyName.title'),
            t('imageStore.toast.errorEmptyName.message'),
          )
        }
        const tmp = this.fileName
        this.fileName = ''
        this.newFileName = ''
        nextTick(() => {
          this.fileName = tmp // Reset to previous name
          this.newFileName = tmp
        })
        return false
      }

      // Same name
      if (trimmedName === this.fileName) {
        const tmp = this.fileName
        this.fileName = ''
        this.newFileName = ''
        nextTick(() => {
          this.fileName = tmp // Reset to previous name
          this.newFileName = tmp
        })
        return true
      }

      // Invalid characters
      if (!isValidFileName(trimmedName)) {
        if (this.file !== null) {
          showToastModal(
            'error',
            t('imageStore.toast.errorInvalidCharacters.title'),
            t('imageStore.toast.errorInvalidCharacters.message'),
          )
        }
        const tmp = this.fileName
        this.fileName = ''
        this.newFileName = ''
        nextTick(() => {
          this.fileName = tmp // Reset to previous name
          this.newFileName = tmp
        })
        return false
      }

      if (trimmedName !== this.fileName && this.fileName !== '' && !isNewFileName) {
        showToastModal(
          'success',
          t('imageStore.toast.successFileNameUpdated.title'),
          t('imageStore.toast.successFileNameUpdated.message'),
        )
      }

      // Remove file extension
      const lastDotIndex = trimmedName.lastIndexOf('.')
      if (lastDotIndex !== -1) {
        trimmedName = trimmedName.slice(0, lastDotIndex)
      }

      // Update file name
      if (isNewFileName) {
        this.newFileName = trimmedName
      } else {
        this.fileName = trimmedName
        this.newFileName = trimmedName
      }

      return true
    },

    closeFile() {
      this.fileName = ''
      this.newFileName = ''
      this.file = null
      this.previewUrl = ''
      this.fileType = ''
      this.fileFormat = ''
      this.newFileFormat = ''
      this.fileDimensions = {
        fileAspectRatio: 1,
        width: 0,
        height: 0,
        quality: 100,
      }
      this.newFileDimensions = {
        fileAspectRatio: 1,
        width: 0,
        height: 0,
        quality: 100,
      }
      this.originalImageDimensions = {
        fileAspectRatio: 1,
        width: 0,
        height: 0,
        quality: 100,
      }
      this.fileSize = 0

      this.originalImage = null
      this.renderedImage = null

      this.svgObjects = []
      this.selectedSvgObjectId = null
    },

    setFile(file, t) {
      this.file = file

      this.setFileName(file.name, t)
      this.fileSize = file.size
      this.fileFormat = file.name.split('.').pop().toLowerCase()
      this.newFileFormat = this.fileFormat
      this.fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type === 'application/pdf'
          ? 'pdf'
          : ''

      const reader = new FileReader()

      if (this.fileType.startsWith('image')) {
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            this.fileDimensions.width = img.width
            this.fileDimensions.height = img.height
            this.fileDimensions.fileAspectRatio = img.width / img.height || 1
            this.newFileDimensions = { ...this.fileDimensions }
            this.originalImageDimensions = { ...this.fileDimensions }

            this.originalImage = img

            // Create a canvas to render the image
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height

            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)

            this.renderedImage = canvas
            this.previewUrl = canvas.toDataURL() // Fallback for export
          }

          img.src = e.target.result
        }

        reader.readAsDataURL(file)
      } else {
        console.error('Unsupported file type:', this.fileType)
      }

      showToastModal(
        'success',
        t('imageStore.toast.successFileUploaded.title'),
        t('imageStore.toast.successFileUploaded.message', { fileName: file.name }),
      )
    },

    checkFile(file) {
      const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']

      if (!supportedTypes.includes(file.type)) {
        return false
      } else {
        return true
      }
    },

    saveToImageStore(files, t, router) {
      if (!files) return

      if (files.length > 1) {
        showToastModal(
          'error',
          t('imageStore.toast.errorMultipleFiles.title'),
          t('imageStore.toast.errorMultipleFiles.message'),
        )
        return
      }

      if (this.checkFile(files[0])) {
        this.setFile(files[0], t)
      } else {
        showToastModal(
          'error',
          t('imageStore.toast.errorUnsupportedFileType.title'),
          t('imageStore.toast.errorUnsupportedFileType.message', { fileType: files[0].type }),
        )
      }

      if (router.currentRoute.value.name !== 'editor') {
        router.push({ name: 'editor' })
      }
    },

    loadFile(t, router) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.png, .jpg, .jpeg, .pdf'
      input.style.display = 'none'

      input.addEventListener('change', () => {
        if (input.files && input.files.length > 0) {
          this.saveToImageStore(input.files, t, router)
        }
      })

      document.body.appendChild(input)
      input.click()
      document.body.removeChild(input)
    },

    exportFile(t) {
      if (!this.renderedImage) return false

      if (this.svgObjects) {
        this.rasterize()
      } else {
        this.previewUrl = this.renderedImage.toDataURL()
      }

      const isPdf = this.newFileFormat === 'pdf'

      const image = new Image()
      image.onload = () => {
        const { width, height, quality } = this.newFileDimensions

        if (isPdf) {
          // Conversion of px to mm (1 px = 0.264583 mm)
          const mmWidth = width * 0.264583
          const mmHeight = height * 0.264583

          const pdf = new jsPDF({
            orientation: mmWidth > mmHeight ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [mmWidth, mmHeight],
          })

          pdf.addImage(image, 'PNG', 0, 0, mmWidth, mmHeight)
          pdf.save(`${this.newFileName}.pdf`)
        } else {
          const mimeType =
            this.newFileFormat === 'jpeg' || this.newFileFormat === 'jpg'
              ? 'image/jpeg'
              : this.newFileFormat === 'webp'
                ? 'image/webp'
                : 'image/png'

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(image, 0, 0, width, height)

          // this.applyEffectsToContext(ctx, canvas)

          canvas.toBlob(
            (blob) => {
              if (!blob) return
              const blobUrl = URL.createObjectURL(blob)

              const link = document.createElement('a')
              link.href = blobUrl
              link.download = `${this.newFileName}.${this.newFileFormat}`
              link.click()

              URL.revokeObjectURL(blobUrl)
            },
            mimeType,
            quality / 100,
          )
        }

        showToastModal(
          'success',
          t('imageStore.toast.successFileExported.title'),
          t('imageStore.toast.successFileExported.message', {
            fileName: this.newFileName,
          }),
        )
      }

      image.src = this.previewUrl

      return true
    },

    async rasterize() {
      if (!this.renderedImage || !this.svgObjects) return

      console.log('Rasterizing image with SVG objects...')

      const width = this.fileDimensions.width
      const height = this.fileDimensions.height

      // Create SVG string from svgObjects
      const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      ${this.svgObjects
        .map((obj) => {
          const attrs = Object.entries(obj.attrs || {})
            .map(([key, val]) => `${key}="${val}"`)
            .join(' ')
          return `<${obj.tag} ${attrs} />`
        })
        .join('\n')}
    </svg>
    `.trim()

      // Create a Blob from the SVG string
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Create a canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      // Draw the rendered image on the canvas
      ctx.drawImage(this.renderedImage, 0, 0)

      // Convert SVG to Image and draw it on the canvas
      await new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          URL.revokeObjectURL(svgUrl)
          resolve()
        }
        img.onerror = (e) => {
          console.error('Error during image loading', e)
          reject(e)
        }
        img.src = svgUrl
      })

      // Result - base64
      const resultDataUrl = canvas.toDataURL()
      // this.previewUrl = resultDataUrl

      // Reset svg elements
      this.svgObjects = []
      this.selectedSvgObjectId = null

      this.renderedImage = canvas
      this.originalImage = canvas
      this.previewUrl = resultDataUrl

      return resultDataUrl
    },

    async applyCrop(cropBox, t) {
      if (!this.renderedImage || !cropBox) return

      // Create confirm modal to confirm rasterization if there are SVG objects
      if (this.svgObjects.length > 0) {
        const confirmed = await showConfirmModal(
          t('tools.confirmNeedRasterization.title'),
          t('tools.confirmNeedRasterization.message'),
          t('tools.confirmNeedRasterization.cancel'),
          t('tools.confirmNeedRasterization.confirm'),
        )
        if (confirmed) {
          await this.rasterize()
        } else {
          return
        }
      }

      const { x, y, width, height } = cropBox

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = width
      canvas.height = height

      ctx.drawImage(
        this.renderedImage,
        x,
        y,
        width,
        height, // source region
        0,
        0,
        width,
        height, // destination canvas
      )

      // Update rendered image and preview URL
      this.renderedImage = canvas
      this.originalImage = canvas
      this.previewUrl = canvas.toDataURL()

      // Update file dimensions
      this.fileDimensions.width = width
      this.fileDimensions.height = height
      this.fileDimensions.fileAspectRatio = width / height || 1

      this.newFileDimensions = { ...this.fileDimensions }
      this.originalImageDimensions = { ...this.fileDimensions }
    },

    applyFlip(direction = 'horizontal') {
      if (!this.renderedImage) return

      const width = this.renderedImage.width
      const height = this.renderedImage.height

      // Flip raster
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.save()

      if (direction === 'horizontal') {
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
      } else if (direction === 'vertical') {
        ctx.translate(0, height)
        ctx.scale(1, -1)
      }

      ctx.drawImage(this.renderedImage, 0, 0)
      ctx.restore()

      this.renderedImage = canvas
      this.previewUrl = canvas.toDataURL()

      // Flip vector objects
      if (this.svgObjects.length === 0) return

      this.svgObjects = this.svgObjects.map((obj) => {
        const newObj = { ...obj, attrs: { ...obj.attrs } }

        const parseNum = (val) => parseFloat(val) || 0

        switch (obj.tag) {
          case 'rect':
            if (direction === 'horizontal') {
              const x = parseNum(obj.attrs.x)
              const w = parseNum(obj.attrs.width)
              newObj.attrs.x = (width - x - w).toString()
            } else {
              const y = parseNum(obj.attrs.y)
              const h = parseNum(obj.attrs.height)
              newObj.attrs.y = (height - y - h).toString()
            }
            break

          case 'circle':
            if (direction === 'horizontal') {
              const cx = parseNum(obj.attrs.cx)
              newObj.attrs.cx = (width - cx).toString()
            } else {
              const cy = parseNum(obj.attrs.cy)
              newObj.attrs.cy = (height - cy).toString()
            }
            break

          case 'ellipse':
            if (direction === 'horizontal') {
              const cx = parseNum(obj.attrs.cx)
              newObj.attrs.cx = (width - cx).toString()
            } else {
              const cy = parseNum(obj.attrs.cy)
              newObj.attrs.cy = (height - cy).toString()
            }
            break

          case 'line':
            if (direction === 'horizontal') {
              newObj.attrs.x1 = (width - parseNum(obj.attrs.x1)).toString()
              newObj.attrs.x2 = (width - parseNum(obj.attrs.x2)).toString()
            } else {
              newObj.attrs.y1 = (height - parseNum(obj.attrs.y1)).toString()
              newObj.attrs.y2 = (height - parseNum(obj.attrs.y2)).toString()
            }
            break

          case 'text':
            if (direction === 'horizontal') {
              const x = parseNum(obj.attrs.x)
              newObj.attrs.x = (width - x).toString()
            } else {
              const y = parseNum(obj.attrs.y)
              newObj.attrs.y = (height - y).toString()
            }
            break

          // case 'path':
          //   // This is an approximation using a transform
          //   const currentTransform = obj.attrs.transform || ''
          //   const flipTransform =
          //     direction === 'horizontal'
          //       ? `scale(-1,1) translate(${-width},0)`
          //       : `scale(1,-1) translate(0,${-height})`

          //   newObj.attrs.transform = `${currentTransform} ${flipTransform}`.trim()
          //   break

          default:
            break
        }

        return newObj
      })
    },

    resetRotation() {
      if (!this.originalImage) return

      // Create a new canvas and draw the original image
      const canvas = document.createElement('canvas')
      canvas.width = this.originalImage.width
      canvas.height = this.originalImage.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(this.originalImage, 0, 0)

      // Set other properties
      this.renderedImage = canvas
      this.previewUrl = canvas.toDataURL()
      this.fileDimensions = { ...this.originalImageDimensions }
      this.newFileDimensions = { ...this.originalImageDimensions }

      this.imageOperations.transformations.rotation = 0

      console.log('Reset rotation done.')
    },

    async applyRotation(angle, t) {
      if (!this.renderedImage || !angle) return

      // Ask for rasterization confirmation if vector objects exist
      if (this.svgObjects.length > 0) {
        const confirmed = await showConfirmModal(
          t('tools.confirmNeedRasterization.title'),
          t('tools.confirmNeedRasterization.message'),
          t('tools.confirmNeedRasterization.cancel'),
          t('tools.confirmNeedRasterization.confirm'),
        )
        if (!confirmed) return
        await this.rasterize()
      }

      const { closest } = useMath()

      if (angle === 90 || angle === -90) {
        this.imageOperations.transformations.rotation = closest(
          this.imageOperations.transformations.rotation + angle,
          [0, 90, 180, 270, 360, -90, -180, -270, -360],
        )
        if (
          this.imageOperations.transformations.rotation === 360 ||
          this.imageOperations.transformations.rotation === -360
        ) {
          this.imageOperations.transformations.rotation = 0
        }
        console.log('Rotation angle set to:', this.imageOperations.transformations.rotation)
      } else {
        this.imageOperations.transformations.rotation = closest(
          this.imageOperations.transformations.rotation,
          [0, 90, 180, 270, 360, -90, -180, -270, -360],
        )

        console.log('Rotation angle set to2:', this.imageOperations.transformations.rotation)

        if (
          this.imageOperations.transformations.rotation === 360 ||
          this.imageOperations.transformations.rotation === -360
        ) {
          this.imageOperations.transformations.rotation = 0
        }
        this.imageOperations.transformations.rotation += angle
      }

      angle = this.imageOperations.transformations.rotation

      const radians = (angle * Math.PI) / 180

      const oldCanvas = this.originalImage
      const oldWidth = oldCanvas.width
      const oldHeight = oldCanvas.height

      const sin = Math.abs(Math.sin(radians))
      const cos = Math.abs(Math.cos(radians))

      const rotatedWidth = Math.round(oldWidth * cos + oldHeight * sin)
      const rotatedHeight = Math.round(oldWidth * sin + oldHeight * cos)

      // Step 1: Rotate into larger temporary canvas
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = rotatedWidth
      tempCanvas.height = rotatedHeight
      const tempCtx = tempCanvas.getContext('2d')

      tempCtx.translate(rotatedWidth / 2, rotatedHeight / 2)
      tempCtx.rotate(radians)
      tempCtx.drawImage(oldCanvas, -oldWidth / 2, -oldHeight / 2)

      let finalCanvas = tempCanvas
      let finalWidth = rotatedWidth
      let finalHeight = rotatedHeight

      // Step 2: If rotation is less than 90 degrees, crop and scale to fill original area
      // if (Math.abs(angle) < 90) {
      //   finalCanvas = document.createElement('canvas')
      //   finalCanvas.width = oldWidth
      //   finalCanvas.height = oldHeight

      //   // Compute center crop area
      //   const cropX = Math.round((rotatedWidth - oldWidth) / 2)
      //   const cropY = Math.round((rotatedHeight - oldHeight) / 2)
      //   const croppedImageData = tempCtx.getImageData(cropX, cropY, oldWidth, oldHeight)

      //   // Optional scale-up to eliminate border gaps caused by rotation
      //   const scaleUpCanvas = document.createElement('canvas')
      //   scaleUpCanvas.width = oldWidth
      //   scaleUpCanvas.height = oldHeight
      //   const scaleCtx = scaleUpCanvas.getContext('2d')

      //   // Create an intermediate canvas to draw cropped result
      //   const cropBuffer = document.createElement('canvas')
      //   cropBuffer.width = oldWidth
      //   cropBuffer.height = oldHeight
      //   const cropCtx = cropBuffer.getContext('2d')
      //   cropCtx.putImageData(croppedImageData, 0, 0)

      //   // Calculate scale factor to eliminate corner gaps
      //   const scaleFactor = angle * 0.08
      //   console.log('Scale factor:', scaleFactor)

      //   scaleCtx.save()
      //   scaleCtx.translate(oldWidth / 2, oldHeight / 2)
      //   scaleCtx.scale(scaleFactor, scaleFactor)
      //   scaleCtx.drawImage(cropBuffer, -oldWidth / 2, -oldHeight / 2)
      //   scaleCtx.restore()

      //   finalCanvas = scaleUpCanvas
      //   finalWidth = oldWidth
      //   finalHeight = oldHeight
      // }

      // Step 3: Save result
      this.renderedImage = finalCanvas
      this.previewUrl = finalCanvas.toDataURL()

      this.fileDimensions.width = finalWidth
      this.fileDimensions.height = finalHeight
      this.fileDimensions.fileAspectRatio = finalWidth / finalHeight
      this.newFileDimensions = { ...this.fileDimensions }
    },
  },
})
