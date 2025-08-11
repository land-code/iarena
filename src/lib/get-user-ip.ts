import z from 'zod'

const IpSchema = z.union([z.ipv4(), z.ipv6()])
const IpifyResponse = z.object({
  ip: IpSchema
})

export async function getUserIp() {
  const res = await fetch('https://api.ipify.org?format=json')
  const data = await res.json()

  const parsed = IpifyResponse.safeParse(data)
  if (!parsed.success) {
    throw new Error(`Respuesta invalida: ${data}`)
  }

  return parsed.data.ip
}
