import type { PaginatedDocs, Payload, TypedUser } from 'payload'

type Args = {
  limit: number
  payload: Payload
  tenantsCollectionSlug: string
  useAsTitle: string
  user?: TypedUser
}
export const findTenantOptions = async ({
  limit,
  payload,
  tenantsCollectionSlug,
  useAsTitle,
  user,
}: Args): Promise<PaginatedDocs> => {
  const isOrderable = payload.collections[tenantsCollectionSlug]?.config?.orderable || false
  return payload.find({
    collection: tenantsCollectionSlug,
    depth: 0,
    limit,
    overrideAccess: false,
    select: {
      [useAsTitle]: true,
      ...(isOrderable ? { _order: true } : {}),
    },
    sort: isOrderable ? '_order' : useAsTitle,
    user,
  })
}
