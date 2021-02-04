const { Keystone } = require('@keystonejs/keystone')
const { Text, File, Relationship } = require('@keystonejs/fields')
const { GraphQLApp } = require('@keystonejs/app-graphql')
const { AdminUIApp } = require('@keystonejs/app-admin-ui')
const { StaticApp } = require('@keystonejs/app-static')
const { LocalFileAdapter } = require('@keystonejs/file-adapters')
const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose')

const PROJECT_NAME = 'futuro'
const adapterConfig = { mongoUri: 'mongodb://localhost/futuro' }

const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
})

const imageAdapter = new LocalFileAdapter({
  src: './public/files/images',
  path: '/files/images',
})

const pdfAdapter = new LocalFileAdapter({
  src: './public/files/pdf',
  path: '/files/pdf',
})

const xlsxAdapter = new LocalFileAdapter({
  src: './public/files/xlsx',
  path: '/files/xlsx',
})

keystone.createList('Category', {
  fields: {
    name: { type: Text, isRequired: true },
    products: {
      type: Relationship,
      ref: 'Product.category',
      many: true,
    },
    image: {
      type: File,
      isRequired: true,
      adapter: imageAdapter,
      hooks: {
        beforeChange: async ({ existingItem }) => {
          if (existingItem && existingItem.image) {
            await imageAdapter.delete(existingItem.image)
          }
        },
      },
    },
  },
  hooks: {
    afterDelete: async ({ existingItem }) => {
      if (existingItem.image) {
        await imageAdapter.delete(existingItem.image)
      }
    },
  },
})

keystone.createList('Product', {
  fields: {
    name: { type: Text, isRequired: true },
    category: {
      type: Relationship,
      ref: 'Category.products',
      many: false,
    },
    image: {
      type: File,
      isRequired: true,
      adapter: imageAdapter,
      hooks: {
        beforeChange: async ({ existingItem }) => {
          if (existingItem && existingItem.image) {
            await imageAdapter.delete(existingItem.image)
          }
        },
      },
    },
    pdf: {
      type: File,
      isRequired: false,
      adapter: pdfAdapter,
      hooks: {
        beforeChange: async ({ existingItem }) => {
          if (existingItem && existingItem.pdf) {
            await pdfAdapter.delete(existingItem.pdf)
          }
        },
      },
    },
    xlsx: {
      type: File,
      isRequired: false,
      adapter: xlsxAdapter,
      hooks: {
        beforeChange: async ({ existingItem }) => {
          if (existingItem && existingItem.xlsx) {
            await xlsxAdapter.delete(existingItem.xlsx)
          }
        },
      },
    },
  },
  hooks: {
    afterDelete: async ({ existingItem }) => {
      if (existingItem.image) {
        await xlsxAdapter.delete(existingItem.image)
      }
      if (existingItem.pdf) {
        await pdfAdapter.delete(existingItem.pdf)
      }
      if (existingItem.xlsx) {
        await xlsxAdapter.delete(existingItem.xlsx)
      }
    },
  },
})

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: '/', src: 'public' }),
    new AdminUIApp({ name: PROJECT_NAME, enableDefaultRoute: true }),
  ],
}
