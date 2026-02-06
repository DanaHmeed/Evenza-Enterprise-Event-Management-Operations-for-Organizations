'use client'

import React from 'react'
import styles from './Button.module.scss'

type ButtonProps = {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
}

export default function Button({
  children,
  type = 'button',
  onClick,
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${className}`}
    >
      {children}
    </button>
  )
}
