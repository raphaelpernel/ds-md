// packages/hub/app/gate/page.tsx
import { authenticateMaster } from '@/lib/auth/actions'
import { Heading } from '@mealz-product-team/design-system/components/ui/typography/Heading/Heading'
import { InputField } from '@mealz-product-team/design-system/components/ui/form/InputField/InputField'
import { Button } from '@mealz-product-team/design-system/components/ui/form/Button/Button'
import { Alert } from '@mealz-product-team/design-system/components/ui/feedback/Alert/Alert'
import './gate.css'

export default async function MasterGatePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  return (
    <main className="hub-gate">
      <form className="hub-gate__form" action={authenticateMaster}>
        <Heading as="h1" size="md">
          Accès équipe
        </Heading>
        <InputField label="Mot de passe" id="password" name="password" type="password" autoFocus required />
        <input type="hidden" name="next" value={next ?? '/'} />
        {error && <Alert variant="danger">Mot de passe incorrect.</Alert>}
        <Button type="submit">Entrer</Button>
      </form>
    </main>
  )
}
