import { fileURLToPath } from 'node:url'
import path from 'path'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
import type { TextField } from 'payload'

import { randomUUID } from 'crypto'

import { buildConfigWithDefaults } from '../buildConfigWithDefaults.js'
import { seed } from './seed.js'
import {
  customIDsSlug,
  customSchemaSlug,
  defaultValuesSlug,
  errorOnUnnamedFieldsSlug,
  fakeCustomIDsSlug,
  fieldsPersistanceSlug,
  pgMigrationSlug,
  placesSlug,
  postsSlug,
  relationASlug,
  relationBSlug,
  relationshipsMigrationSlug,
} from './shared.js'

const defaultValueField: TextField = {
  name: 'defaultValue',
  type: 'text',
  defaultValue: 'default value from database',
}

export default buildConfigWithDefaults({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'categories',
      versions: { drafts: true },
      fields: [
        {
          type: 'text',
          name: 'title',
        },
      ],
    },
    {
      slug: 'categories-custom-id',
      versions: { drafts: true },
      fields: [
        {
          type: 'number',
          name: 'id',
        },
      ],
    },
    {
      slug: postsSlug,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          // access: { read: () => false },
        },
        {
          type: 'relationship',
          relationTo: 'categories',
          name: 'category',
        },
        {
          type: 'relationship',
          relationTo: 'categories-custom-id',
          name: 'categoryCustomID',
        },
        {
          name: 'localized',
          type: 'text',
          localized: true,
        },
        {
          name: 'text',
          type: 'text',
        },
        {
          name: 'number',
          type: 'number',
        },
        {
          type: 'blocks',
          name: 'blocks',
          blocks: [
            {
              slug: 'block-third',
              fields: [
                {
                  type: 'blocks',
                  name: 'nested',
                  blocks: [
                    {
                      slug: 'block-fourth',
                      fields: [
                        {
                          type: 'blocks',
                          name: 'nested',
                          blocks: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'tabs',
          tabs: [
            {
              name: 'D1',
              fields: [
                {
                  name: 'D2',
                  type: 'group',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          type: 'collapsible',
                          fields: [
                            {
                              type: 'tabs',
                              tabs: [
                                {
                                  fields: [
                                    {
                                      name: 'D3',
                                      type: 'group',
                                      fields: [
                                        {
                                          type: 'row',
                                          fields: [
                                            {
                                              type: 'collapsible',
                                              fields: [
                                                {
                                                  name: 'D4',
                                                  type: 'text',
                                                },
                                              ],
                                              label: 'Collapsible2',
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                  label: 'Tab1',
                                },
                              ],
                            },
                          ],
                          label: 'Collapsible2',
                        },
                      ],
                    },
                  ],
                },
              ],
              label: 'Tab1',
            },
          ],
        },
        {
          name: 'hasTransaction',
          type: 'checkbox',
          hooks: {
            beforeChange: [({ req }) => !!req.transactionID],
          },
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'throwAfterChange',
          type: 'checkbox',
          defaultValue: false,
          hooks: {
            afterChange: [
              ({ value }) => {
                if (value) {
                  throw new Error('throw after change')
                }
              },
            ],
          },
        },
        {
          name: 'arrayWithIDs',
          type: 'array',
          fields: [
            {
              name: 'text',
              type: 'text',
            },
          ],
        },
        {
          name: 'blocksWithIDs',
          type: 'blocks',
          blocks: [
            {
              slug: 'block-first',
              fields: [
                {
                  name: 'text',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
      hooks: {
        beforeOperation: [
          ({ args, operation, req }) => {
            if (operation === 'update') {
              const defaultIDType = req.payload.db.defaultIDType

              if (defaultIDType === 'number' && typeof args.id === 'string') {
                throw new Error('ID was not sanitized to a number properly')
              }
            }

            return args
          },
        ],
      },
    },
    {
      slug: errorOnUnnamedFieldsSlug,
      fields: [
        {
          type: 'tabs',
          tabs: [
            {
              label: 'UnnamedTab',
              fields: [
                {
                  name: 'groupWithinUnnamedTab',
                  type: 'group',
                  fields: [
                    {
                      name: 'text',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: defaultValuesSlug,
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        defaultValueField,
        {
          name: 'array',
          type: 'array',
          // default array with one object to test subfield defaultValue properties for Mongoose
          defaultValue: [{}],
          fields: [defaultValueField],
        },
        {
          name: 'group',
          type: 'group',
          // we need to have to use as default in order to have subfield defaultValue properties directly for Mongoose
          defaultValue: {},
          fields: [defaultValueField],
        },
        {
          name: 'select',
          type: 'select',
          defaultValue: 'default',
          options: [
            { value: 'option0', label: 'Option 0' },
            { value: 'option1', label: 'Option 1' },
            { value: 'default', label: 'Default' },
          ],
        },
        {
          name: 'point',
          type: 'point',
          defaultValue: [10, 20],
        },
        {
          name: 'escape',
          type: 'text',
          defaultValue: "Thanks, we're excited for you to join us.",
        },
      ],
    },
    {
      slug: relationASlug,
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'richText',
          type: 'richText',
        },
      ],
      labels: {
        plural: 'Relation As',
        singular: 'Relation A',
      },
    },
    {
      slug: relationBSlug,
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'relationship',
          type: 'relationship',
          relationTo: 'relation-a',
        },
        {
          name: 'richText',
          type: 'richText',
        },
      ],
      labels: {
        plural: 'Relation Bs',
        singular: 'Relation B',
      },
    },
    {
      slug: pgMigrationSlug,
      fields: [
        {
          name: 'relation1',
          type: 'relationship',
          relationTo: 'relation-a',
        },
        {
          name: 'myArray',
          type: 'array',
          fields: [
            {
              name: 'relation2',
              type: 'relationship',
              relationTo: 'relation-b',
            },
            {
              name: 'mySubArray',
              type: 'array',
              fields: [
                {
                  name: 'relation3',
                  type: 'relationship',
                  localized: true,
                  relationTo: 'relation-b',
                },
              ],
            },
          ],
        },
        {
          name: 'myGroup',
          type: 'group',
          fields: [
            {
              name: 'relation4',
              type: 'relationship',
              localized: true,
              relationTo: 'relation-b',
            },
          ],
        },
        {
          name: 'myBlocks',
          type: 'blocks',
          blocks: [
            {
              slug: 'myBlock',
              fields: [
                {
                  name: 'relation5',
                  type: 'relationship',
                  relationTo: 'relation-a',
                },
                {
                  name: 'relation6',
                  type: 'relationship',
                  localized: true,
                  relationTo: 'relation-b',
                },
              ],
            },
          ],
        },
      ],
      versions: true,
    },
    {
      slug: customSchemaSlug,
      dbName: 'customs',
      fields: [
        {
          name: 'text',
          type: 'text',
        },
        {
          name: 'localizedText',
          type: 'text',
          localized: true,
        },
        {
          name: 'relationship',
          type: 'relationship',
          hasMany: true,
          relationTo: 'relation-a',
        },
        {
          name: 'select',
          type: 'select',
          dbName: ({ tableName }) => `${tableName}_customSelect`,
          enumName: 'selectEnum',
          hasMany: true,
          options: ['a', 'b', 'c'],
        },
        {
          name: 'radio',
          type: 'select',
          enumName: 'radioEnum',
          options: ['a', 'b', 'c'],
        },
        {
          name: 'array',
          type: 'array',
          dbName: 'customArrays',
          fields: [
            {
              name: 'text',
              type: 'text',
            },
            {
              name: 'localizedText',
              type: 'text',
              localized: true,
            },
          ],
        },
        {
          name: 'blocks',
          type: 'blocks',
          blocks: [
            {
              slug: 'block-second',
              dbName: 'customBlocks',
              fields: [
                {
                  name: 'text',
                  type: 'text',
                },
                {
                  name: 'localizedText',
                  type: 'text',
                  localized: true,
                },
              ],
            },
          ],
        },
      ],
      versions: {
        drafts: true,
      },
    },
    {
      slug: placesSlug,
      fields: [
        {
          name: 'country',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
      ],
    },
    {
      slug: 'virtual-relations',
      admin: { useAsTitle: 'postTitle' },
      access: { read: () => true },
      fields: [
        {
          name: 'postTitle',
          type: 'text',
          virtual: 'post.title',
        },
        {
          name: 'postTitleHidden',
          type: 'text',
          virtual: 'post.title',
          hidden: true,
        },
        {
          name: 'postCategoryTitle',
          type: 'text',
          virtual: 'post.category.title',
        },
        {
          name: 'postCategoryID',
          type: 'json',
          virtual: 'post.category.id',
        },
        {
          name: 'postCategoryCustomID',
          type: 'number',
          virtual: 'post.categoryCustomID.id',
        },
        {
          name: 'postID',
          type: 'json',
          virtual: 'post.id',
        },
        {
          name: 'postLocalized',
          type: 'text',
          virtual: 'post.localized',
        },
        {
          name: 'post',
          type: 'relationship',
          relationTo: 'posts',
        },
        {
          name: 'customID',
          type: 'relationship',
          relationTo: 'custom-ids',
        },
        {
          name: 'customIDValue',
          type: 'text',
          virtual: 'customID.id',
        },
      ],
      versions: { drafts: true },
    },
    {
      slug: fieldsPersistanceSlug,
      fields: [
        {
          name: 'text',
          type: 'text',
          virtual: true,
        },
        {
          name: 'textHooked',
          type: 'text',
          virtual: true,
          hooks: { afterRead: [() => 'hooked'] },
        },
        {
          name: 'array',
          type: 'array',
          virtual: true,
          fields: [],
        },
        {
          type: 'row',
          fields: [
            {
              type: 'text',
              name: 'textWithinRow',
              virtual: true,
            },
          ],
        },
        {
          type: 'collapsible',
          fields: [
            {
              type: 'text',
              name: 'textWithinCollapsible',
              virtual: true,
            },
          ],
          label: 'Colllapsible',
        },
        {
          type: 'tabs',
          tabs: [
            {
              label: 'tab',
              fields: [
                {
                  type: 'text',
                  name: 'textWithinTabs',
                  virtual: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: customIDsSlug,
      fields: [
        {
          name: 'id',
          type: 'text',
          admin: {
            readOnly: true,
          },
          hooks: {
            beforeChange: [
              ({ value, operation }) => {
                if (operation === 'create') {
                  return randomUUID()
                }
                return value
              },
            ],
          },
        },
        {
          name: 'title',
          type: 'text',
        },
      ],
      versions: { drafts: true },
    },
    {
      slug: fakeCustomIDsSlug,
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'group',
          type: 'group',
          fields: [
            {
              name: 'id',
              type: 'text',
            },
          ],
        },
        {
          type: 'tabs',
          tabs: [
            {
              name: 'myTab',
              fields: [
                {
                  name: 'id',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: relationshipsMigrationSlug,
      fields: [
        {
          type: 'relationship',
          relationTo: 'default-values',
          name: 'relationship',
        },
        {
          type: 'relationship',
          relationTo: ['default-values'],
          name: 'relationship_2',
        },
      ],
      versions: true,
    },
    {
      slug: 'compound-indexes',
      fields: [
        {
          name: 'one',
          type: 'text',
        },
        {
          name: 'two',
          type: 'text',
        },
        {
          name: 'three',
          type: 'text',
        },
        {
          name: 'group',
          type: 'group',
          fields: [
            {
              name: 'four',
              type: 'text',
            },
          ],
        },
      ],
      indexes: [
        {
          fields: ['one', 'two'],
          unique: true,
        },
        {
          fields: ['three', 'group.four'],
          unique: true,
        },
      ],
    },
    {
      slug: 'aliases',
      fields: [
        {
          name: 'thisIsALongFieldNameThatCanCauseAPostgresErrorEvenThoughWeSetAShorterDBName',
          dbName: 'shortname',
          type: 'array',
          fields: [
            {
              name: 'nestedArray',
              type: 'array',
              dbName: 'short_nested_1',
              fields: [
                {
                  type: 'text',
                  name: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: 'blocks-docs',
      fields: [
        {
          type: 'blocks',
          localized: true,
          blocks: [
            {
              slug: 'cta',
              fields: [
                {
                  type: 'text',
                  name: 'text',
                },
              ],
            },
          ],
          name: 'testBlocksLocalized',
        },
        {
          type: 'blocks',
          blocks: [
            {
              slug: 'cta',
              fields: [
                {
                  type: 'text',
                  name: 'text',
                },
              ],
            },
          ],
          name: 'testBlocks',
        },
      ],
    },
    {
      slug: 'unique-fields',
      fields: [
        {
          name: 'slugField',
          type: 'text',
          unique: true,
        },
      ],
    },
  ],
  globals: [
    {
      slug: 'header',
      fields: [
        {
          name: 'itemsLvl1',
          type: 'array',
          dbName: 'header_items_lvl1',
          fields: [
            {
              name: 'label',
              type: 'text',
            },
            {
              name: 'itemsLvl2',
              type: 'array',
              dbName: 'header_items_lvl2',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                },
                {
                  name: 'itemsLvl3',
                  type: 'array',
                  dbName: 'header_items_lvl3',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                    },
                    {
                      name: 'itemsLvl4',
                      type: 'array',
                      dbName: 'header_items_lvl4',
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: 'global',
      dbName: 'customGlobal',
      fields: [
        {
          name: 'text',
          type: 'text',
        },
      ],
      versions: true,
    },
    {
      slug: 'global-2',
      fields: [
        {
          name: 'text',
          type: 'text',
        },
      ],
    },
    {
      slug: 'global-3',
      fields: [
        {
          name: 'text',
          type: 'text',
        },
      ],
    },
    {
      slug: 'virtual-relation-global',
      fields: [
        {
          type: 'text',
          name: 'postTitle',
          virtual: 'post.title',
        },
        {
          type: 'relationship',
          name: 'post',
          relationTo: 'posts',
        },
      ],
    },
  ],
  localization: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
  },
  onInit: async (payload) => {
    if (process.env.SEED_IN_CONFIG_ONINIT !== 'false') {
      await seed(payload)
    }
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})

export const postDoc = {
  title: 'test post',
}
