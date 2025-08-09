import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Link from 'next/link'

export default async function LogoutPage() {
  const { success } = await auth.api.signOut({ headers: await headers() })
  return (
    <div>
      {success && (
        <>
          <p>Se ha cerrado la sesión. Puedes volver a iniciar aquí:</p>
          <Button asChild>
            <Link href='/sign-in'>Iniciar sesión</Link>
          </Button>
        </>
      )}
      {!success && 'No se ha podido cerrar la sesión. Recarga para volver a intentarlo'}
    </div>
  )
}
