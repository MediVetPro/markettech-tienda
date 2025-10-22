'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  interactive?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  interactive = false, 
  size = 'md',
  showValue = false,
  className = ''
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClick = (newRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating)
    }
  }

  const handleMouseEnter = (newRating: number) => {
    if (interactive) {
      setHoverRating(newRating)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`flex ${interactive ? 'gap-1' : ''}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
            className={`${sizeClasses[size]} ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-all duration-200 ${
              star <= displayRating 
                ? 'text-yellow-400 fill-current' 
                : interactive 
                  ? 'text-gray-300 hover:text-yellow-300' 
                  : 'text-gray-300'
            }`}
          >
            <Star className="w-full h-full" />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="text-gray-600 ml-2 text-sm">
          ({rating.toFixed(1)})
        </span>
      )}
      {interactive && rating === 0 && (
        <span className="text-gray-500 ml-2 text-sm">
          Haz clic en una estrella para valorar
        </span>
      )}
    </div>
  )
}
