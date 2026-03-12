/**
 * @file: ImportTranslations.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import fs from 'fs'
import path from 'path'
import xlsx from 'xlsx'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const localesDir = path.join(__dirname, '../src/locales')
const inputFile = 'translations.xlsx' // alebo 'translations.json'

const unflatten = (items) => {
  const result = {}
  for (const { key, value } of items) {
    const parts = key.split('.')
    let obj = result
    parts.forEach((part, i) => {
      const isLast = i === parts.length - 1

      // Vytvor pole, ak všetky kľúče sú číselné
      const nextPart = parts[i + 1]
      const isNextIndex = /^\d+$/.test(nextPart)

      if (!isLast) {
        if (!obj[part]) {
          obj[part] = isNextIndex ? [] : {}
        }
        obj = obj[part]
      } else {
        if (Array.isArray(obj)) {
          obj[parseInt(part)] = value
        } else {
          obj[part] = value
        }
      }
    })
  }
  return result
}

const importTranslations = () => {
  let data = []

  const fullInputPath = path.join(__dirname, '..', inputFile)

  if (inputFile.endsWith('.xlsx')) {
    const workbook = xlsx.readFile(fullInputPath)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    data = xlsx.utils.sheet_to_json(sheet)
  } else {
    data = JSON.parse(fs.readFileSync(fullInputPath, 'utf8'))
  }

  const byLang = {}

  for (const item of data) {
    const { namespace, key, ...langs } = item

    for (const lang of Object.keys(langs)) {
      if (!byLang[lang]) byLang[lang] = {}
      if (!byLang[lang][namespace]) byLang[lang][namespace] = []
      byLang[lang][namespace].push({ key, value: langs[lang] })
    }
  }

  for (const lang of Object.keys(byLang)) {
    const langPath = path.join(localesDir, lang)
    if (!fs.existsSync(langPath)) fs.mkdirSync(langPath)

    for (const namespace of Object.keys(byLang[lang])) {
      const entries = byLang[lang][namespace]
      const grouped = unflatten(entries)
      const filePath = path.join(langPath, `${namespace}.json`)
      fs.writeFileSync(filePath, JSON.stringify(grouped, null, 2), 'utf8')
      console.log(`✅ Imported ${lang}/${namespace}.json`)
    }
  }
}

importTranslations()
