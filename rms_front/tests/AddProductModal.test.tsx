import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import AddProductModal from '@/components/administration/AddProductModal'
import { categoriesApi, menuApi } from '@/api/menu/menu'


vi.mock('@/api/menu/menu', () => ({
  categoriesApi: {
    getCategories: vi.fn()
  },
  menuApi: {
    createMenuItem: vi.fn()
  }
}))

describe('AddProductModal', () => {
  const styleForm = 'div.fixed.inset-0.bg-black\\/50'
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onProductAdded: vi.fn()
  }

  const mockCategories = [
    { category_id: 1, name: 'Пиццы', description: null },
    { category_id: 2, name: 'Напитки', description: null }
  ]

  beforeEach(() => {
    vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockCategories)
    vi.mocked(menuApi.createMenuItem).mockResolvedValue({ menu_id: 123,
    food_name: 'Тестовое блюдо',
    price: 500,
    category_id: 1,
    is_available: true,
    preparation_time: '15'
  })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('Проверка обязательных полей', async () => {
    const { container } = render(<AddProductModal {...mockProps} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /добавить/i })).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: /добавить/i })
    const nameInput = container.querySelector<HTMLInputElement>('input[name="food_name"]')!
    const priceInput = container.querySelector<HTMLInputElement>('input[name="price"]')!
    const categorySelect = container.querySelector<HTMLSelectElement>('select[name="category_id"]')!

    expect(nameInput).toBeInTheDocument()
    expect(priceInput).toBeInTheDocument()
    expect(categorySelect).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(confirmButton)
    })
    expect(menuApi.createMenuItem).not.toHaveBeenCalled()

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Маргарита' } })
      fireEvent.change(priceInput, { target: { value: '500' } })
      fireEvent.change(categorySelect, { target: { value: '1' } })
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(menuApi.createMenuItem).toHaveBeenCalled()
      expect(mockProps.onProductAdded).toHaveBeenCalled()
      expect(mockProps.onClose).toHaveBeenCalled()
    })

    vi.mocked(menuApi.createMenuItem).mockClear()

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: '' } })
      fireEvent.click(confirmButton)
    })
    expect(menuApi.createMenuItem).not.toHaveBeenCalled()
  })


  it('Закрытие окна при нажатии на крестик', async () => {
    render(<AddProductModal {...mockProps} />)

    const closeButton = screen.getByRole('button', { name: /закрыть/i })
    await act(async () => {
      fireEvent.click(closeButton)
    })

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('Закрытие окна при нажатии вне его области', async () => {
    render(<AddProductModal {...mockProps} />)

    const overlay = document.querySelector(styleForm)
    expect(overlay).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(overlay!)
    })

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('Проверка типа файла для изображения', async () => {
    const { container } = render(<AddProductModal {...mockProps} />)
    
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!

    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    fireEvent.change(fileInput, { target: { files: [invalidFile] } })
    await waitFor(() => {
      expect(screen.getByText(/разрешены только jpg, png и webp/i)).toBeInTheDocument()
    })
  })

  it('Проверка размера файла для изображения', async () => {
    const { container } = render(<AddProductModal {...mockProps} />)
    
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]')!
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'test.jpg', { 
      type: 'image/jpeg' 
    })
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } })
    await waitFor(() => {
      expect(screen.getByText(/размер файла не должен превышать 5mb/i)).toBeInTheDocument()
    })
  })
})