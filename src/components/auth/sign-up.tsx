'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import Image from 'next/image'
import { Loader2, X } from 'lucide-react'
import { signUp } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className='z-50 w-full max-w-md'>
      <CardHeader>
        <CardTitle className='text-lg md:text-xl'>Registrarse</CardTitle>
        <CardDescription className='text-xs md:text-sm'>
          Introduce tu información para crear una cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='first-name'>Nombre</Label>
              <Input
                id='first-name'
                placeholder='Leo'
                required
                onChange={e => {
                  setFirstName(e.target.value)
                }}
                value={firstName}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='last-name'>Apellidos</Label>
              <Input
                id='last-name'
                placeholder='Rodríguez'
                required
                onChange={e => {
                  setLastName(e.target.value)
                }}
                value={lastName}
              />
            </div>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='m@example.com'
              required
              onChange={e => {
                setEmail(e.target.value)
              }}
              value={email}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='password'>Contraseña</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete='new-password'
              placeholder='Contraseña'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='password'>Confirma la constraseña</Label>
            <Input
              id='password_confirmation'
              type='password'
              value={passwordConfirmation}
              onChange={e => setPasswordConfirmation(e.target.value)}
              autoComplete='new-password'
              placeholder='Confirma la contraseña'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='image'>Foto de perfil (opcional)</Label>
            <div className='flex items-end gap-4'>
              {imagePreview && (
                <div className='relative h-16 w-16 overflow-hidden rounded-sm'>
                  <Image src={imagePreview} alt='Profile preview' layout='fill' objectFit='cover' />
                </div>
              )}
              <div className='flex w-full items-center gap-2'>
                <Input
                  id='image'
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                  className='w-full'
                />
                {imagePreview && (
                  <X
                    className='cursor-pointer'
                    onClick={() => {
                      setImage(null)
                      setImagePreview(null)
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          <Button
            type='submit'
            className='w-full'
            disabled={loading}
            onClick={async () => {
              await signUp.email({
                email,
                password,
                name: `${firstName} ${lastName}`,
                image: image ? await convertImageToBase64(image) : '',
                callbackURL: '/dashboard',
                fetchOptions: {
                  onResponse: () => {
                    setLoading(false)
                  },
                  onRequest: () => {
                    setLoading(true)
                  },
                  onError: ctx => {
                    toast.error(ctx.error.message)
                  },
                  onSuccess: async () => {
                    router.push('/dashboard')
                  }
                }
              })
            }}
          >
            {loading ? <Loader2 size={16} className='animate-spin' /> : 'Crear una cuenta'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
