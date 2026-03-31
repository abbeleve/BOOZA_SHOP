import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CartProvider, type CartItem } from '@/contexts/CartContext'
import { UserProvider } from '@/contexts/UserContext'
import Cart from '@/components/cart/Cart'

describe('Cart', () => {
  const styleQuantity = 'span.font-bold.w-6.text-center'
  const styleCartTotal = 'p.text-3xl.font-bold.text-text-primary.font-main'
  const createTestItem = (quantity: number = 1): CartItem => ({
    id: 1,
    title: 'Тестовая пицца',
    price: 500,
    displayPrice: '500 ₽',
    imageUrl: '/test.jpg',
    quantity,
  })
  const priceSelector = 'span.font-bold.text-lg'

  const addTestItemToStorage = (...items: CartItem[]) => {
    localStorage.setItem('restaurant_cart', JSON.stringify(items))
  }

  const normalize = (str: string) => str.replace(/\s/g, '')

  afterEach(() => {
    localStorage.clear()
  })

  it('Показывается сообщение при пустой корзине', () => {
    render(
      <CartProvider>
        <Cart />
      </CartProvider>
    )
    expect(screen.getByText(/корзина пуста/i)).toBeInTheDocument()
  })

  it('Увеличивает количество товара при нажатии на кнопку плюс', async () => {
    const testItem = createTestItem(1)
    addTestItemToStorage(testItem)
    
    render(
      <UserProvider>
        <CartProvider>
            <Cart />
        </CartProvider>
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(testItem.title)).toBeInTheDocument()
    })

    const quantityDisplay = screen.getByText((testItem.quantity).toString(), { selector: styleQuantity })
    expect(quantityDisplay).toBeInTheDocument()

    const increaseButton = screen.getByRole('button', { name: /увеличить/i })
    fireEvent.click(increaseButton)

    await waitFor(() => {
      expect(screen.getByText((testItem.quantity + 1).toString(), { selector: styleQuantity })).toBeInTheDocument()
    })
  })

  it('Уменьшает количество товара при нажатии на кнопку минус', async () => {
    const testItem = createTestItem(2)
    addTestItemToStorage(testItem)
    
    render(
      <UserProvider>
        <CartProvider>
            <Cart />
        </CartProvider>
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(testItem.title)).toBeInTheDocument()
    })

    expect(screen.getByText((testItem.quantity).toString(), { selector: styleQuantity })).toBeInTheDocument()

    const decreaseButton = screen.getByRole('button', { name: /уменьшить/i })
    fireEvent.click(decreaseButton)

    await waitFor(() => {
      expect(screen.getByText((testItem.quantity - 1).toString(), { selector: styleQuantity })).toBeInTheDocument()
    })
  })

  it('Удаляется товар из корзины при нулевом количестве', async () => {
    const testItem = createTestItem(1)
    addTestItemToStorage(testItem)
    
    render(
      <UserProvider>
        <CartProvider>
          <Cart />
        </CartProvider>
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(testItem.title)).toBeInTheDocument()
    })

    expect(screen.getByText((testItem.quantity).toString(), { selector: styleQuantity })).toBeInTheDocument()

    const decreaseButton = screen.getByRole('button', { name: /уменьшить/i })
    fireEvent.click(decreaseButton)

    await waitFor(() => {
      expect(screen.queryByText(testItem.title)).not.toBeInTheDocument()
    })

    expect(screen.getByText(/корзина пуста/i)).toBeInTheDocument()
  })

  it('Удаляет товар из корзины при нажатии на кнопку удаления', async () => {
    const testItem = createTestItem(1)
    addTestItemToStorage(testItem)
    
    render(
      <UserProvider>
        <CartProvider>
          <Cart />
        </CartProvider>
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(testItem.title)).toBeInTheDocument()
    })

    expect(screen.getByText(testItem.title)).toBeInTheDocument()

    const deleteButton = screen.getByRole('button', { name: /удалить/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.queryByText(testItem.title)).not.toBeInTheDocument()
    })

    expect(screen.getByText(/корзина пуста/i)).toBeInTheDocument()
  })

  it('Очищает корзину с несколькими разными товарами', async () => {
    const multipleItems: CartItem[] = [
      { ...createTestItem(2), title: 'Пицца' },
      { ...createTestItem(), id: 2, title: 'Бургер', price: 200, displayPrice: '200 ₽' },
      { ...createTestItem(3), id: 3, title: 'Лимонад', price: 150, displayPrice: '150 ₽' },
    ]
    addTestItemToStorage(...multipleItems)
    
    render(
      <UserProvider>
        <CartProvider>
          <Cart />
        </CartProvider>
      </UserProvider>
    )

    await waitFor(() => {
      multipleItems.forEach((item) => {
        expect(screen.getByText(item.title)).toBeInTheDocument()
      })
    })

    multipleItems.forEach((item) => {
      expect(screen.getByText(item.title)).toBeInTheDocument()
    })

    const clearButton = screen.getByRole('button', { name: /очистить/i })
    fireEvent.click(clearButton)

    await waitFor(() => {
      multipleItems.forEach((item) => {
        expect(screen.queryByText(item.title)).not.toBeInTheDocument()
      })
    })

    expect(screen.getByText(/корзина пуста/i)).toBeInTheDocument()
  })

  it('Рассчитывает общую стоимость корректно', async () => {
    const testItem = createTestItem(1)
    addTestItemToStorage(testItem)
    
    render(
      <UserProvider>
        <CartProvider>
            <Cart />
        </CartProvider>
      </UserProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(testItem.title)).toBeInTheDocument()
    })

    const expectedTotal = (testItem.price * testItem.quantity).toLocaleString('ru-RU') + ' ₽'
    const priceElement = screen.getByText((content) => {
      return normalize(content).includes(normalize(expectedTotal))
    }, { selector: priceSelector })
    
    expect(priceElement).toBeInTheDocument()
  })

    it('Рассчитывается и отображается итоговая сумма корзины корректно', async () => {
    const testItems: CartItem[] = [
      { ...createTestItem(), title: 'Пицца' },
      { ...createTestItem(2), id: 2, title: 'Бургер', price: 200, displayPrice: '200 ₽' },
      { ...createTestItem(3), id: 3, title: 'Сок', price: 150, displayPrice: '150 ₽' },
    ]
    
    addTestItemToStorage(...testItems)
    
    render(
      <UserProvider>
        <CartProvider>
          <Cart />
        </CartProvider>
      </UserProvider>
    )

    await waitFor(() => {
      testItems.forEach((item) => {
        expect(screen.getByText(item.title)).toBeInTheDocument()
      })
    })

    const expectedTotal = testItems.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)
    
    const formattedTotal = expectedTotal.toLocaleString('ru-RU') + ' ₽'
    
    const totalPriceElement = screen.getByText((content) => {
      return normalize(content).includes(normalize(formattedTotal))
    }, { selector: styleCartTotal })
    
    expect(totalPriceElement).toBeInTheDocument()
  })
})