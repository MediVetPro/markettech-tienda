'use client'

import { useState, useEffect } from 'react'
import { StarRating } from './StarRating'
import { useAuth } from '@/contexts/AuthContext'

interface ProductRatingFormProps {
  productId: string
  onRatingSubmit?: (rating: number, comment: string) => void
  existingRating?: {
    rating: number
    comment: string
  }
}

export function ProductRatingForm({ 
  productId, 
  onRatingSubmit,
  existingRating 
}: ProductRatingFormProps) {
  const [rating, setRating] = useState(existingRating?.rating || 0)
  const [comment, setComment] = useState(existingRating?.comment || '')

  // Actualizar el estado cuando cambie existingRating
  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating)
      setComment(existingRating.comment || '')
    } else {
      setRating(0)
      setComment('')
    }
  }, [existingRating])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isAuthenticated, user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔐 Estado de autenticación:', isAuthenticated)
    console.log('👤 Usuario:', user)
    
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para valorar productos')
      return
    }

    if (rating === 0) {
      alert('Por favor selecciona una valoración')
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('smartesh_token')
      console.log('🔑 Token obtenido del localStorage:', token ? 'Sí' : 'No')
      console.log('🔑 Token completo:', token)
      
      if (!token) {
        alert('No hay token de autenticación')
        return
      }

      const response = await fetch('/api/products/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || null
        })
      })

      if (response.ok) {
        alert('¡Valoración enviada con éxito!')
        if (onRatingSubmit) {
          onRatingSubmit(rating, comment)
        }
        // Reset form
        setRating(0)
        setComment('')
      } else {
        const error = await response.text()
        alert(`Error al enviar valoración: ${error}`)
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Error al enviar la valoración')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">
          Debes iniciar sesión para valorar este producto
        </p>
        <a
          href="/login"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Iniciar Sesión
        </a>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {existingRating ? 'Editar tu valoración' : 'Valora este producto'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tu valoración: <span className="text-red-500">*</span>
          </label>
          <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              interactive={true}
              size="lg"
              showValue={true}
            />
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comentario (opcional):
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia con este producto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 caracteres
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setRating(0)
              setComment('')
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enviando...' : existingRating ? 'Actualizar' : 'Enviar valoración'}
          </button>
        </div>
      </form>
    </div>
  )
}
