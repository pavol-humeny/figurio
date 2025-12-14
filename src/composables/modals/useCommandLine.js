import { ref, nextTick, onMounted, onBeforeMount } from 'vue'
import { useConsole } from '../common/useConsole'
import { useApi } from '../common/useApi'
import { userModeConfig } from '@/config/userModeConfig'
import { globalConfig } from '@/config/globalConfig'

const { warn } = useConsole()
const { addUserEvent } = useApi()

export function useCommandLine(userModeStore, editorStore) {
  /**
   * Command line state
   */
  const command = ref('')
  const output = ref([])
  const outputRef = ref(null)

  /**
   * Command history
   */
  const history = ref([])
  const historyIndex = ref(-1)

  /**
   * Process entered command
   */
  const processCommand = () => {
    const trimmed = command.value.trim()
    if (!trimmed) return

    // Save to history
    history.value.push(trimmed)
    historyIndex.value = history.value.length

    pushCommandLine(trimmed)

    // Split into parts
    const parts = trimmed.toLowerCase().split(/\s+/)
    const main = parts[0]
    const args = parts.slice(1)

    // Command switch
    switch (main) {
      case 'quit':
        switchToBasicMode()
        break

      case 'clear':
        output.value = []
        break

      case 'help':
        printHelp()
        break

      case 'man':
        if (args.length === 0) {
          output.value.push('Specify a command: man <command>')
        } else {
          const manCommand = args.join(' ')
          printManPage(manCommand)
        }
        break

      case 'turn':
        handleTurnCommand(args)
        break

      case 'set':
        handleSetCommand(args)
        break

      case 'reset':
        handleResetCommand(args)
        break

      default:
        output.value.push('Unknown command: ' + trimmed)
    }

    command.value = ''

    nextTick(() => {
      if (outputRef.value) {
        outputRef.value.scrollTop = outputRef.value.scrollHeight
      }
    })
  }

  /**
   * Handle 'turn on/off' commands
   */
  const handleTurnCommand = (args) => {
    if (args.length < 2) {
      output.value.push('Usage: turn <on/off> <feature>')
      return
    }

    const action = args[0]
    const feature = args[1]
    const full = `turn ${action} ${feature}`

    if (action === 'on') {
      useManPrint(`turn on ${feature}`)
    }

    // Execute command
    switch (full) {
      case 'turn on snowfall':
        editorStore.turnOnRandomEvent('snowfall')
        warn('Snowfall enabled via contact form')
        addUserEvent('command', { commandIdentifier: full })
        break

      case 'turn off snowfall':
        editorStore.turnOffRandomEvent('snowfall')
        warn('Snowfall disabled via contact form')
        addUserEvent('command', { commandIdentifier: full })
        break

      case 'turn on christmaslights':
        editorStore.turnOnRandomEvent('christmasLights')
        warn('Christmas lights enabled via contact form')
        addUserEvent('command', { commandIdentifier: full })
        break

      case 'turn off christmaslights':
        editorStore.turnOffRandomEvent('christmasLights')
        warn('Christmas lights disabled via contact form')
        addUserEvent('command', { commandIdentifier: full })
        break

      case 'turn off randomevents':
        editorStore.turnOffRandomEvent('snowfall')
        editorStore.turnOffRandomEvent('christmasLights')
        editorStore.turnOffRandomEvent('christmasTree')
        warn('Random events disabled via contact form')
        addUserEvent('command', { commandIdentifier: full })
        break

      case 'turn on randomevents':
        editorStore.turnOnRandomEvent('snowfall')
        editorStore.turnOnRandomEvent('christmasLights')
        editorStore.turnOnRandomEvent('christmasTree')
        warn('Random events enabled via contact form')
        addUserEvent('command', { commandIdentifier: full })
        break

      case 'turn on christmastree':
        editorStore.turnOnRandomEvent('christmasTree')
        warn('Christmas tree enabled via contact form')
        addUserEvent('command', { commandIdentifier: full })
        break

      case 'turn off christmastree':
        editorStore.turnOffRandomEvent('christmasTree')
        warn('Christmas tree disabled via contact form')
        addUserEvent('command', { commandIdentifier: full })
        break

      default:
        output.value.push(`Unknown turn command: ${full}`)
    }
  }

  const handleSetCommand = (args) => {
    if (args.length < 2) {
      output.value.push('Usage: set <setting> <value>')
      return
    }

    const setting = args[0]
    const value = args[1]
    const commandIdentifier = `set ${setting}`

    console.log('SET COMMAND:', commandIdentifier, value)

    // Execute command
    switch (commandIdentifier) {
      case 'set primarycolor':
        setPrimaryColor(value)
        addUserEvent('command', { commandIdentifier: `${commandIdentifier} ${value}` })
        break

      default:
        output.value.push(`Unknown set command: ${commandIdentifier}`)
    }
  }

  const handleResetCommand = (args) => {
    if (args.length < 1) {
      output.value.push('Usage: reset <setting>')
      return
    }

    const setting = args[0]
    const commandIdentifier = `reset ${setting}`

    // Execute command
    switch (commandIdentifier) {
      case 'reset all':
        resetPrimaryColor()
        editorStore.turnOffRandomEvent('snowfall')
        editorStore.turnOffRandomEvent('christmasLights')
        editorStore.turnOffRandomEvent('christmasTree')
        addUserEvent('command', { commandIdentifier })
        break
      case 'reset primarycolor':
        resetPrimaryColor()
        addUserEvent('command', { commandIdentifier })
        break

      default:
        output.value.push(`Unknown reset command: ${commandIdentifier}`)
    }
  }

  const setPrimaryColor = (color) => {
    document.documentElement.style.setProperty('--primary-c', color)

    // Save to localStorage
    localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}primaryColor`, color)
  }

  const resetPrimaryColor = () => {
    // Remove inline override
    document.documentElement.style.removeProperty('--primary-c')

    // Remove saved value
    localStorage.removeItem(`${globalConfig.LOCAL_STORAGE_PREFIX}primaryColor`)
  }

  /**
   * Print man page hint
   *
   * @param {string} commandName  Name of the command
   */
  const useManPrint = (commandName) => {
    output.value.push(`For more information on '${commandName}', type 'man ${commandName}'`)
  }

  /**
   * Print help information
   * Data are taken from userModeConfig.js
   */
  const printHelp = () => {
    const commands = userModeConfig.listOfCommands
    output.value.push('Available commands:')
    commands.forEach((cmd) => output.value.push(' - ' + cmd))
  }

  /**
   * Print man page for a specific command
   * Data are taken from userModeConfig.js
   *
   * @param {string} commandName  Name of the command to print
   */
  const printManPage = (commandName) => {
    const manPage = userModeConfig.commandManPages[commandName]
    if (manPage) {
      output.value.push(manPage)
    } else {
      output.value.push('No manual entry for ' + commandName)
    }
  }

  /**
   * Push command line to output
   *
   * @param {string} enteredCommand  Entered command
   */
  const pushCommandLine = (enteredCommand) => {
    if (!outputRef.value) return
    output.value.push(`${userModeStore.userMode}@figurio:~/$ ${enteredCommand}`)

    nextTick(() => {
      if (outputRef.value) {
        outputRef.value.scrollTop = outputRef.value.scrollHeight
      }
    })
  }

  /**
   * Switch to basic mode
   */
  const switchToBasicMode = () => {
    userModeStore.setUserMode('basic')
  }

  /**
   * Handle keydown events for command history navigation
   */
  const handleKeydown = (e) => {
    // Ctrl + D - switch to basic mode
    if (e.ctrlKey && e.key.toLowerCase() === 'd') {
      e.preventDefault()
      switchToBasicMode()
      return
    }

    // CTRL + C - clear command line
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault()
      command.value = ''
      return
    }

    // ArrowUp - previous command
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.value.length === 0) return

      historyIndex.value = Math.max(0, historyIndex.value - 1)
      command.value = history.value[historyIndex.value]
      return
    }

    // ArrowDown - next command
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (history.value.length === 0) return

      historyIndex.value = Math.min(history.value.length, historyIndex.value + 1)

      if (historyIndex.value === history.value.length) {
        command.value = ''
      } else {
        command.value = history.value[historyIndex.value]
      }
    }
  }

  /**
   * Lifecycle hooks
   */
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
