import { Suspense } from 'react'
import { SearchResultsPage } from '../../src/components/search/SearchResultsPage'

export default function Page() {
  return (
    <Suspense>
      <SearchResultsPage />
    </Suspense>
  )
}
