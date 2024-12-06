import fs from 'fs'
import path from 'path'
import https from 'https'

const TAXONOMY_URL = 'https://www.google.com/basepages/producttype/taxonomy.en-US.txt'
const OUTPUT_PATH = path.join(process.cwd(), 'utils', 'googleProductCategories.ts')

interface Category {
  id: number
  name: string
  parent_id: number | null
  full_path: string
}

function fetchTaxonomy(): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(TAXONOMY_URL, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => resolve(data))
      res.on('error', reject)
    }).on('error', reject)
  })
}

function parseTaxonomy(data: string): Category[] {
  const lines = data
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.trim())

  const categories: Category[] = []
  const pathToId = new Map<string, number>()

  lines.forEach((line, index) => {
    const id = index + 1 // Generate sequential IDs
    const parts = line.split('>')
    const name = parts[parts.length - 1].trim()
    const fullPath = line
    const parentPath = parts.slice(0, -1).join('>').trim()
    const parentId = parentPath ? pathToId.get(parentPath) || null : null

    pathToId.set(line, id)

    categories.push({
      id,
      name,
      parent_id: parentId,
      full_path: fullPath
    })
  })

  return categories
}

function generateTypeScriptCode(categories: Category[]): string {
  return `// Generated from ${TAXONOMY_URL}
// Last updated: ${new Date().toISOString()}

export interface GoogleProductCategory {
  id: number
  name: string
  parent_id: number | null
  full_path: string
}

export const GOOGLE_PRODUCT_CATEGORIES: GoogleProductCategory[] = ${
  JSON.stringify(categories, null, 2)
}

export function getGoogleProductCategoryById(id: number): GoogleProductCategory | undefined {
  return GOOGLE_PRODUCT_CATEGORIES.find(category => category.id === id)
}

export function getParentCategories(category: GoogleProductCategory): GoogleProductCategory[] {
  const parents: GoogleProductCategory[] = []
  let currentCategory = category

  while (currentCategory.parent_id !== null) {
    const parent = GOOGLE_PRODUCT_CATEGORIES.find(c => c.id === currentCategory.parent_id)
    if (parent) {
      parents.unshift(parent)
      currentCategory = parent
    } else {
      break
    }
  }

  return parents
}

export function getCategoryHierarchy(categoryId: number): GoogleProductCategory[] {
  const category = getGoogleProductCategoryById(categoryId)
  if (!category) return []

  return [...getParentCategories(category), category]
}

export function getChildCategories(parentId: number | null): GoogleProductCategory[] {
  return GOOGLE_PRODUCT_CATEGORIES.filter(category => category.parent_id === parentId)
}

export function searchCategories(query: string): GoogleProductCategory[] {
  const lowerQuery = query.toLowerCase()
  return GOOGLE_PRODUCT_CATEGORIES.filter(category => 
    category.name.toLowerCase().includes(lowerQuery) || 
    category.full_path.toLowerCase().includes(lowerQuery)
  )
}`
}

async function main() {
  try {
    console.log('Fetching Google Product Categories...')
    const data = await fetchTaxonomy()
    
    console.log('Parsing taxonomy...')
    const categories = parseTaxonomy(data)
    
    console.log('Generating TypeScript code...')
    const code = generateTypeScriptCode(categories)
    
    console.log('Writing to file...')
    fs.writeFileSync(OUTPUT_PATH, code)
    
    console.log(`Successfully generated ${categories.length} categories`)
    console.log(`Output written to: ${OUTPUT_PATH}`)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
