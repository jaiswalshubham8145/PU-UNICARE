import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
    it('renders correctly', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('calls onClick handler when clicked', async () => {
        const handleClick = vi.fn()
        const { getByText } = render(<Button onClick={handleClick}>Click me</Button>)

        getByText('Click me').click()
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Click me</Button>)
        expect(screen.getByText('Click me')).toBeDisabled()
    })
})
