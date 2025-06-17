import { computed } from 'vue'
import { useConfirmModal } from '../modals/useConfirmModal'

export function useCloseFileButton(imageStore, t){
  const disabled = computed(() => {
    return !imageStore.isImageLoaded()
  })

  const { showConfirmModal } = useConfirmModal()

  const closeFile = async () => {
    const confirmed = await showConfirmModal(
      t("topPanel.closeFileButton.confirm.title"),
      t("topPanel.closeFileButton.confirm.message"),
      t("topPanel.closeFileButton.confirm.cancel"),
      t("topPanel.closeFileButton.confirm.confirm")
    )
    if (confirmed) {
      imageStore.closeFile()
    }
  }

  return{
    disabled,
    closeFile,
  }
}
