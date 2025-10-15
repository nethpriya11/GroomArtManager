import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { KPICard } from '@/components/features/common/KPICard'
import { DollarSign } from 'lucide-react'

describe('KPICard', () => {
  it('renders the title and value correctly', () => {
    render(<KPICard title="Total Revenue" value="$1,234.56" />)

    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('$1,234.56')).toBeInTheDocument()
  })

  it('renders a numerical value', () => {
    render(<KPICard title="Items Out of Stock" value={42} />)

    expect(screen.getByText('Items Out of Stock')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders the icon when provided', () => {
    render(
      <KPICard
        title="Total Value"
        value="$5,000"
        icon={<DollarSign data-testid="kpi-icon" />}
      />
    )

    expect(screen.getByTestId('kpi-icon')).toBeInTheDocument()
  })

  it('renders without an icon', () => {
    render(<KPICard title="Low Stock Items" value={5} />)

    // Query for the icon role, should not be found
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument()
  })
})
