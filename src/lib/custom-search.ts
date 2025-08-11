import { google } from 'googleapis'

const customSearch = google.customsearch('v1')

export const getImageFromGoogle = async (query: string) => {
  const res = await customSearch.cse.list({
    auth: process.env.CUSTOM_SEARCH_API_KEY,
    cx: process.env.CX_SEARCH_ENGINE_ID,
    q: query,
    searchType: 'image',
    num: 1
  })

  const { items } = res.data
  return items?.[0]?.link ?? null
}
