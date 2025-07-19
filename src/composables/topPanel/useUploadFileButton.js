export function useUploadFileButton(imageStore, t, router) {
  const uploadFile = async () => {
    imageStore.loadFile(t, router)
  }

  return {
    uploadFile,
  }
}
