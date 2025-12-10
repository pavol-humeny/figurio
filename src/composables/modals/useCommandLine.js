import { ref, nextTick, onMounted, onBeforeMount } from 'vue'
import { useConsole } from '../common/useConsole'
import { useApi } from '../common/useApi'
import { userModeConfig } from '@/config/userModeConfig'

const { warn } = useConsole()
const { addUserEvent } = useApi()

export function useCommandLine(userModeStore, editorStore) {
  const command = ref('')
  const output = ref([])
  const outputRef = ref(null) // reference to CLI output div

  const processCommand = () => {
    const trimmed = command.value.trim()
    if (!trimmed) return

    pushCommandLine(trimmed)

    switch (trimmed.toLowerCase()) {
      case 'quit':
        switchToBasicMode()
        break
      case 'clear':
        output.value = []
        break
      case 'turn on':
        useManPrint('turn on')
        break
      case 'turn off randomEvents':
        editorStore.randomEvents.snowfallActive = false
        editorStore.randomEvents.christmasLightsActive = false
        warn('Random events disabled via contact form')
        addUserEvent('command', { commandIdentifier: 'turn off randomEvents' })
        break
      case 'turn on snowfall':
        editorStore.randomEvents.snowfallActive = true
        warn('Snowfall enabled via contact form')
        addUserEvent('command', { commandIdentifier: 'turn on snowfall' })
        break
      case 'turn off snowfall':
        editorStore.randomEvents.snowfallActive = false
        warn('Snowfall disabled via contact form')
        addUserEvent('command', { commandIdentifier: 'turn off snowfall' })
        break
      case 'turn on christmasLights':
        editorStore.randomEvents.christmasLightsActive = true
        warn('Christmas lights enabled via contact form')
        addUserEvent('command', { commandIdentifier: 'turn on christmasLights' })
        break
      case 'turn off christmasLights':
        editorStore.randomEvents.christmasLightsActive = false
        warn('Christmas lights disabled via contact form')
        addUserEvent('command', { commandIdentifier: 'turn off christmasLights' })
        break
      case 'man help':
        printManPage('help')
        break
      case 'man turn on':
        printManPage('turn on')
        break
      case 'man turn off':
        printManPage('turn off')
        break
      case 'help':
        printHelp()
        break
      default:
        output.value.push('Unknown command: ' + trimmed)
    }

    command.value = ''

    // Scroll to bottom after next DOM update
    nextTick(() => {
      if (outputRef.value) {
        outputRef.value.scrollTop = outputRef.value.scrollHeight
      }
    })
  }

  const useManPrint = (commandName) => {
    output.value.push(`For more information on '${commandName}', type 'man ${commandName}'`)
  }

  const printHelp = () => {
    const commands = userModeConfig.listOfCommands
    output.value.push('Available commands:')
    commands.forEach((cmd) => {
      output.value.push(' - ' + cmd)
    })
  }

  const printManPage = (commandName) => {
    const manPage = userModeConfig.commandManPages[commandName]
    if (manPage) {
      output.value.push(manPage) // don't trim(), keep spaces and newlines
    } else {
      output.value.push('No manual entry for ' + commandName)
    }
  }

  const pushCommandLine = (enteredCommand) => {
    if (!outputRef.value) return
    output.value.push(`${userModeStore.userMode}@figurio:~/$ ${enteredCommand}`)

    // Scroll to bottom after next DOM update
    nextTick(() => {
      if (outputRef.value) {
        outputRef.value.scrollTop = outputRef.value.scrollHeight
      }
    })
  }

  const switchToBasicMode = () => {
    userModeStore.setUserMode('basic')
  }

  // Add event to ctrl + d for switching to basic mode
  const handleKeydown = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'd') {
      e.preventDefault()
      switchToBasicMode()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onBeforeMount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    command,
    output,
    outputRef,
    processCommand,
    switchToBasicMode,
  }
}
