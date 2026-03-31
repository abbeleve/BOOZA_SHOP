import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CartProvider, type CartItem  } from '@/contexts/CartContext'
import { UserProvider } from '@/contexts/UserContext'
import CheckoutModal from '@/components/cart/CheckoutModal'

describe('CheckoutModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onOrderCompleted: vi.fn()
  }

  const addTestItemToStorage = (...items: CartItem[]) => {
    localStorage.setItem('restaurant_cart', JSON.stringify(items))
  }

  const testItem :CartItem = {
    id: 1,
    title: 'Тестовая пицца',
    price: 500,
    displayPrice: '500 ₽',
    imageUrl: '/test.jpg',
    quantity: 1,
  }

  const mockMapInstance = {
    behaviors: { enable: vi.fn() },
    controls: { add: vi.fn() },
    events: { add: vi.fn() },
    geoObjects: { add: vi.fn(), remove: vi.fn() },
    setCenter: vi.fn(),
    container: { fitToViewport: vi.fn() }
  }

  const mockSearchControlInstance = {
    events: { add: vi.fn() },
    getResult: vi.fn().mockResolvedValue({
      geometry: { getCoordinates: () => [52.283, 104.20] },
      getAddress: () => 'Тестовый адрес'
    })
  }

  const mockPlacemarkInstance = {
    events: { add: vi.fn() },
    geometry: { getCoordinates: () => [52.283, 104.20] },
    properties: { set: vi.fn() }
  }

  const mockYmaps = {
    ready: (callback: () => void) => callback(),
    Map: vi.fn().mockImplementation(function() {
      return mockMapInstance
    }),
    control: {
      SearchControl: vi.fn().mockImplementation(function() {
        return mockSearchControlInstance
      })
    },
    geocode: vi.fn().mockResolvedValue({
      geoObjects: {
        get: () => ({
          getAddress: () => 'Тестовый адрес'
        })
      }
    }),
    Placemark: vi.fn().mockImplementation(function() {
      return mockPlacemarkInstance
    })
  }

  const styleForm = 'div.fixed.inset-0.bg-black\\/50'

  beforeEach(() => {
    Object.defineProperty(window, 'ymaps', {
      value: mockYmaps,
      writable: true,
      configurable: true
    })
    addTestItemToStorage(testItem)
  })

  afterEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('Проверка обязательных форм', async () => {
    render(
      <CartProvider>
        <UserProvider>
          <CheckoutModal {...mockProps} />
        </UserProvider>
      </CartProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(new RegExp(testItem.title))).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: /подтвердить заказ/i })
    const requiredTextInputs = screen.getAllByRole('textbox').filter(
      input => input.hasAttribute('required')
    )
    const addressInput = requiredTextInputs.find(
      input => input.getAttribute('type') === 'text'
    )!
    const phoneInput = requiredTextInputs.find(
      input => input.getAttribute('type') === 'tel'
    )!

    expect(confirmButton).toBeDisabled()

    fireEvent.change(phoneInput, { target: { value: '+7 (999) 123-45-67' } })
    expect(confirmButton).toBeDisabled()

    fireEvent.change(phoneInput, { target: { value: '' } })
    fireEvent.change(addressInput, { target: { value: 'г. Иркутск, ул. Ленина, 10' } })
    expect(confirmButton).toBeDisabled()

    fireEvent.change(phoneInput, { target: { value: '+7 (999) 123-45-67' } })
    expect(confirmButton).toBeEnabled()

    fireEvent.change(addressInput, { target: { value: '' } })
    expect(confirmButton).toBeDisabled()
  })

  it('Закрытие окна при нажатии на крестик', async () => {
    render(
      <CartProvider>
        <UserProvider>
          <CheckoutModal {...mockProps} />
        </UserProvider>
      </CartProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(new RegExp(testItem.title))).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button', { name: /закрыть/i })
    fireEvent.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

it('Закрытие окна при нажатии вне его области', async () => {
    render(
      <CartProvider>
        <UserProvider>
          <CheckoutModal {...mockProps} />
        </UserProvider>
      </CartProvider>
    )

    const overlay = document.querySelector(styleForm)
    expect(overlay).toBeInTheDocument()
    fireEvent.click(overlay!)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })
})