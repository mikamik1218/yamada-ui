import { ComputedFields, defineDocumentType, makeSource } from 'contentlayer/source-files'
import GithubSlugger from 'github-slugger'
import remarkEmoji from 'remark-emoji'
import remarkGfm from 'remark-gfm'
import remarkSlug from 'remark-slug'
import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { CONSTANT } from './constant'
import { includes } from './utils/array'
import { locales, otherLocales } from './utils/i18n'

const OTHER_LOCALES = `(${otherLocales.join('|')})`

const omitLocaleSlug = (path: string): string => {
  const reg = new RegExp(`\(/index\)?.${OTHER_LOCALES}$`)

  path = path.replace(reg, '')

  return path
}

const getLocale = (path: string): string => {
  let locale = path.match(/(\.[^\.]*)$/)?.[1]

  locale = locale?.replace(/\./, '')

  return includes(locales, locale) ? locale : CONSTANT.I18N.DEFAULT_LOCALE
}

const rehypeMdxCodeMeta: Plugin = () => (tree) => {
  visit(tree, 'element', (node: any) => {
    if (node.tagName !== 'code' || !node.data) return

    node.properties = node.properties || {}

    const props: string[] = node.data.meta.split(' ')

    props.forEach((prop) => {
      const [key, value] = prop.split('=')

      node.properties[key] = value
    })
  })
}

export const getTableOfContents = (raw: string, maxLv = Infinity) => {
  const slugger = new GithubSlugger()

  const regexp = new RegExp(/^(## |### |#### )(.*)\n/, 'gm')
  const contents = [...raw.matchAll(regexp)]

  if (!contents.length) return []

  return contents
    .map(([, lv, title]) => {
      title = title.trim()
      lv = lv.trim()

      const id = slugger.slug(title, false)

      return { id, title, lv: lv.split('#').length - 1 }
    })
    .filter(({ lv }) => maxLv >= lv)
}

const computedFields: ComputedFields = {
  slug: {
    type: 'string',
    resolve: ({ _raw }) => `/docs/${omitLocaleSlug(_raw.flattenedPath)}`,
  },
}

const Doc = defineDocumentType(() => ({
  name: 'Doc',
  filePathPattern: '**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    menu: { type: 'string' },
    tab: { type: 'string' },
    description: { type: 'string', required: true },
    order: { type: 'number', default: 530000 },
    table_of_contents_max_lv: { type: 'number', default: Infinity },
    label: {
      type: 'enum',
      options: ['New', 'Considering', 'Planned', 'Experimental'],
    },
    tags: { type: 'list', of: { type: 'string' } },
    is_expand: { type: 'boolean', default: false },
    is_active: { type: 'boolean', default: true },
    is_tabs: { type: 'boolean', default: false },
    with_table_of_contents: { type: 'boolean', default: true },
    with_children: { type: 'boolean', default: false },
    with_children_description: { type: 'boolean', default: true },
    with_description: { type: 'boolean', default: false },
    version: { type: 'string' },
    package: { type: 'string' },
    release_url: { type: 'string' },
    release_date: { type: 'string' },
  },
  computedFields: {
    ...computedFields,
    data: {
      type: 'json',
      resolve: async ({ _id, _raw, title, body, table_of_contents_max_lv, ...rest }) => ({
        ...rest,
        title,
        locale: getLocale(_raw.flattenedPath),
        paths: omitLocaleSlug(_raw.flattenedPath).split('/'),
        editUrl: `${CONSTANT.SNS.GITHUB.EDIT_URL}/${_id}`,
        contents: getTableOfContents(body.raw, table_of_contents_max_lv),
      }),
    },
  },
}))

export default makeSource({
  contentDirPath: 'contents',
  documentTypes: [Doc],
  mdx: {
    rehypePlugins: [rehypeMdxCodeMeta],
    remarkPlugins: [remarkSlug, remarkGfm, remarkEmoji],
  },
})
