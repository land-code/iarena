import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Link from 'next/link'

export default async function LogoutPage() {
  await auth.api.signOut({ headers: await headers() })
  return (
    <div>
      Se ha cerrado la sesión. Puedes volver a iniciar aquí:
      <Button asChild>
        <Link href='/sign-in'>Iniciar sesión</Link>
      </Button>
    </div>
  )
}
