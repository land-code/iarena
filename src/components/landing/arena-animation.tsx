'use client'

import { HandFistIcon } from 'lucide-react'
import { useState, useEffect } from 'react'

const PARTICLE_LIFETIME = 1000 // ms
const PARTICLE_COUNT = 3
const PARTICLE_CHANCE = 0.3

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

type Particle = {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  createdAt: number
}

export default function ArenaAnimation() {
  const [particles, setParticles] = useState<Particle[]>([])

  function createParticles(x: number, y: number) {
    const newParticles: Particle[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT
      const distance = randomRange(10, 30)
      newParticles.push({
        id: Math.random().toString(36).slice(2),
        startX: x,
        startY: y,
        endX: x + Math.cos(angle) * distance,
        endY: y + Math.sin(angle) * distance,
        createdAt: Date.now()
      })
    }
    setParticles(p => [...p, ...newParticles])
  }

  // Cleanup old particles
  useEffect(() => {
    if (particles.length === 0) return
    const interval = setInterval(() => {
      const now = Date.now()
      setParticles(p => p.filter(part => now - part.createdAt < PARTICLE_LIFETIME))
    }, 100)
    return () => clearInterval(interval)
  }, [particles])

  function handleMouseMove(e: React.MouseEvent) {
    const chance = Math.random()
    if (chance > PARTICLE_CHANCE) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    createParticles(x, y)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className='relative inline-block cursor-default select-none'
      style={{ perspective: '800px' }}
    >
      <h1 className='relative z-10 text-6xl font-semibold'>Donde la IA lucha contigo</h1>

      {/* Render particles */}
      {particles.map(({ id, startX, startY, endX, endY, createdAt }) => {
        const age = Date.now() - createdAt
        const progress = age / PARTICLE_LIFETIME
        const x = startX + (endX - startX) * progress
        const y = startY + (endY - startY) * progress
        const opacity = 1 - progress

        return (
          <HandFistIcon
            key={id}
            className='bg-primary-foreground text-primary absolute rounded-full'
            style={{
              width: 32,
              height: 32,
              top: y,
              left: x,
              opacity,
              pointerEvents: 'none',
              transform: `translate(-50%, -50%)`,
              transition: 'opacity 0.3s ease-out'
            }}
          />
        )
      })}
    </div>
  )
}
