'use client'

import type { JsonObject } from 'payload'

import { useModal } from '@faceless-ui/modal'
import { validateMimeType } from 'payload/shared'
import React from 'react'
import { toast } from 'sonner'

import { useConfig } from '../../providers/Config/index.js'
import { EditDepthProvider } from '../../providers/EditDepth/index.js'
import { useTranslation } from '../../providers/Translation/index.js'
import { UploadControlsProvider } from '../../providers/UploadControls/index.js'
import { Drawer, useDrawerDepth } from '../Drawer/index.js'
import { AddFilesView } from './AddFilesView/index.js'
import { AddingFilesView } from './AddingFilesView/index.js'
import { FormsManagerProvider, useFormsManager } from './FormsManager/index.js'

const drawerSlug = 'bulk-upload-drawer-slug'

function DrawerContent() {
  const { addFiles, forms, isInitializing } = useFormsManager()
  const { closeModal } = useModal()
  const { collectionSlug, drawerSlug } = useBulkUpload()
  const { getEntityConfig } = useConfig()
  const { t } = useTranslation()

  const uploadCollection = getEntityConfig({ collectionSlug })
  const uploadConfig = uploadCollection?.upload
  const uploadMimeTypes = uploadConfig?.mimeTypes

  const onDrop = React.useCallback(
    (acceptedFiles: FileList) => {
      const fileTransfer = new DataTransfer()
      for (const candidateFile of acceptedFiles) {
        if (
          uploadMimeTypes === undefined ||
          uploadMimeTypes.length === 0 ||
          validateMimeType(candidateFile.type, uploadMimeTypes)
        ) {
          fileTransfer.items.add(candidateFile)
        }
      }
      if (fileTransfer.files.length === 0) {
        toast.error(t('error:invalidFileType'))
      } else {
        void addFiles(fileTransfer.files)
      }
    },
    [addFiles, t, uploadMimeTypes],
  )

  if (!collectionSlug) {
    return null
  }

  if (!forms.length && !isInitializing) {
    return (
      <AddFilesView
        acceptMimeTypes={uploadMimeTypes?.join(', ')}
        onCancel={() => closeModal(drawerSlug)}
        onDrop={onDrop}
      />
    )
  } else {
    return <AddingFilesView />
  }
}

export type BulkUploadProps = {
  readonly children: React.ReactNode
}

export function BulkUploadDrawer() {
  const { drawerSlug } = useBulkUpload()

  return (
    <Drawer gutter={false} Header={null} slug={drawerSlug}>
      <FormsManagerProvider>
        <UploadControlsProvider>
          <EditDepthProvider>
            <DrawerContent />
          </EditDepthProvider>
        </UploadControlsProvider>
      </FormsManagerProvider>
    </Drawer>
  )
}

type BulkUploadContext = {
  collectionSlug: string
  drawerSlug: string
  initialFiles: FileList
  maxFiles: number
  onCancel: () => void
  onSuccess: (newDocs: JsonObject[], errorCount: number) => void
  setCollectionSlug: (slug: string) => void
  setInitialFiles: (files: FileList) => void
  setMaxFiles: (maxFiles: number) => void
  setOnCancel: (onCancel: BulkUploadContext['onCancel']) => void
  setOnSuccess: (onSuccess: BulkUploadContext['onSuccess']) => void
}

const Context = React.createContext<BulkUploadContext>({
  collectionSlug: '',
  drawerSlug: '',
  initialFiles: undefined,
  maxFiles: undefined,
  onCancel: () => null,
  onSuccess: () => null,
  setCollectionSlug: () => null,
  setInitialFiles: () => null,
  setMaxFiles: () => null,
  setOnCancel: () => null,
  setOnSuccess: () => null,
})
export function BulkUploadProvider({
  children,
  drawerSlugPrefix,
}: {
  readonly children: React.ReactNode
  readonly drawerSlugPrefix?: string
}) {
  const [collection, setCollection] = React.useState<string>()
  const [onSuccessFunction, setOnSuccessFunction] = React.useState<BulkUploadContext['onSuccess']>()
  const [onCancelFunction, setOnCancelFunction] = React.useState<BulkUploadContext['onCancel']>()
  const [initialFiles, setInitialFiles] = React.useState<FileList>(undefined)
  const [maxFiles, setMaxFiles] = React.useState<number>(undefined)
  const drawerSlug = `${drawerSlugPrefix ? `${drawerSlugPrefix}-` : ''}${useBulkUploadDrawerSlug()}`

  const setCollectionSlug: BulkUploadContext['setCollectionSlug'] = (slug) => {
    setCollection(slug)
  }

  const setOnSuccess: BulkUploadContext['setOnSuccess'] = (onSuccess) => {
    setOnSuccessFunction(() => onSuccess)
  }

  return (
    <Context
      value={{
        collectionSlug: collection,
        drawerSlug,
        initialFiles,
        maxFiles,
        onCancel: () => {
          if (typeof onCancelFunction === 'function') {
            onCancelFunction()
          }
        },
        onSuccess: (docIDs, errorCount) => {
          if (typeof onSuccessFunction === 'function') {
            onSuccessFunction(docIDs, errorCount)
          }
        },
        setCollectionSlug,
        setInitialFiles,
        setMaxFiles,
        setOnCancel: setOnCancelFunction,
        setOnSuccess,
      }}
    >
      <React.Fragment>
        {children}
        <BulkUploadDrawer />
      </React.Fragment>
    </Context>
  )
}

export const useBulkUpload = () => React.use(Context)

export function useBulkUploadDrawerSlug() {
  const depth = useDrawerDepth()

  return `${drawerSlug}-${depth || 1}`
}
