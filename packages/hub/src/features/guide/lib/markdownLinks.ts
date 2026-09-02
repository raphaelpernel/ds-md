const REPOSITORY_SOURCE_BASE = 'https://github.com/raphaelpernel/ds-md/blob/main/'

export function repositorySourceUrl(href: string | undefined, sourcePath: string) {
  if (!href || href.startsWith('#') || href.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')) {
    return href ?? ''
  }

  const sourceDirectory = sourcePath.slice(0, sourcePath.lastIndexOf('/') + 1)
  return new URL(href, `${REPOSITORY_SOURCE_BASE}${sourceDirectory}`).toString()
}