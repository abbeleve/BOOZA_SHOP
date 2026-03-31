import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '@/components/base/products/ProductCard.tsx'

describe('ProductCard', () => {
  const styleLoading = '.animate-pulse'
  const mockProduct = {
    id: 1,
    imageUrl: '/test.png',
    title: 'Тестовое блюдо',
    description: 'Описание',
    price: '500 ₽',
    priceValue: 500,
    loading: false
  }

  it('Корректно тображается информация о продукте', () => {
    render(<ProductCard {...mockProduct} />)
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument()
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument()
    expect(screen.getByText(mockProduct.price)).toBeInTheDocument()
  })

  it('Вызов onAddToCart при нажатии на кнопку', () => {
    const onAddToCart = vi.fn()
    render(<ProductCard {...mockProduct} onAddToCart={onAddToCart} />)
    fireEvent.click(screen.getByRole('button', { name: /добавить/i }))
    expect(onAddToCart).toHaveBeenCalledWith({
      id: mockProduct.id,
      title: mockProduct.title,
      price: mockProduct.priceValue,
      displayPrice: mockProduct.price,
      imageUrl: mockProduct.imageUrl
    })
  })

  it('Отображается animate-pulse при загрузке', () => {
    const {container} = render(<ProductCard {...mockProduct} loading={true} />)
    
    expect(container.querySelector(styleLoading)).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('Отображается изображение продукта, когда загрузка завершена', () => {
    const {container} = render(<ProductCard {...mockProduct} loading={false} />)
    
    const image = screen.getByRole('img', { name: mockProduct.title })
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', mockProduct.imageUrl)
    expect(image).toHaveAttribute('alt', mockProduct.title)
    
    expect(container.querySelector(styleLoading)).not.toBeInTheDocument()
  })
})