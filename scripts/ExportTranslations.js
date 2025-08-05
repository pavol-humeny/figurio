import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import xlsx from 'xlsx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const localesDir = path.join(__dirname, '../src/locales')
const languages = ['en', 'sk', 'cz']
const exportAsExcel = true // ⬅️ prepni na false ak chceš len JSON

const flatten = (obj, prefix = '') =>
  Object.entries(obj).reduce((acc, [key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof val === 'object' && val !== null) {
      acc.push(...flatten(val, fullKey))
    } else {
      acc.push({ key: fullKey, value: val })
    }
    return acc
  }, [])

const collectTranslations = () => {
  const result = {}

  for (const lang of languages) {
    const langPath = path.join(localesDir, lang)
    const files = fs.readdirSync(langPath)

    for (const file of files) {
      const namespace = file.replace('.json', '')
      const fullPath = path.join(langPath, file)
      const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      const flat = flatten(json)

      for (const { key, value } of flat) {
        const uid = `${namespace}::${key}`
        if (!result[uid]) {
          result[uid] = { namespace, key }
        }
        result[uid][lang] = value
      }
    }
  }

  return Object.values(result)
}

const exportTranslations = () => {
  const data = collectTranslations()

  if (exportAsExcel) {
    const worksheet = xlsx.utils.json_to_sheet(data)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Translations')
    xlsx.writeFile(workbook, path.join(__dirname, '../translations.xlsx'))
    console.log('✅ Exported to translations.xlsx')
  } else {
    fs.writeFileSync(
      path.join(__dirname, '../translations.json'),
      JSON.stringify(data, null, 2),
      'utf8',
    )
    console.log('✅ Exported to translations.json')
  }
}

exportTranslations()
