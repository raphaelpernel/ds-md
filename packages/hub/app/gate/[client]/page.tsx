// packages/hub/app/gate/[client]/page.tsx
import { notFound } from 'next/navigation'
import { findClientNamespace } from '@/config/namespaces'
import { authenticateClient } from '@/lib/auth/actions'
import { Heading } from '@mealz-product-team/design-system/components/ui/typography/Heading/Heading'
import { InputField } from '@mealz-product-team/design-system/components/ui/form/InputField/InputField'
import { Button } from '@mealz-product-team/design-system/components/ui/form/Button/Button'
import { Alert } from '@mealz-product-team/design-system/components/ui/feedback/Alert/Alert'
import '../gate.css'

export default async function ClientGatePage({
  params,
  searchParams,
}: {
  params: Promise<{ client: string }>
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { client } = await params
  const { next, error } = await searchParams
  const namespace = findClientNamespace(client)
  if (!namespace) {
    notFound()
  }

  const action = authenticateClient.bind(null, namespace.id)

  return (
    <main className="hub-gate">
      <form className="hub-gate__form" action={action}>
        <Heading as="h1" size="md">
          Accès {namespace.label}
        </Heading>
        <InputField label="Mot de passe" id="password" name="password" type="password" autoFocus required />
        <input type="hidden" name="next" value={next ?? `/${namespace.id}`} />
        {error && <Alert variant="danger">Mot de passe incorrect.</Alert>}
        <Button type="submit">Entrer</Button>
      </form>
    </main>
  )
}
