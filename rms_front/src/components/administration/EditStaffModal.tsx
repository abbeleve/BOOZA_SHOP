import { useState, useEffect } from 'react';
import apiClient from '@/api/client';

interface StaffMember {
  username: string;
  role: string;
  user_id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  patronymic?: string;
  address?: string;
}

interface EditStaffModalProps {
  isOpen: boolean;
  staff: StaffMember | null;
  onClose: () => void;
  onStaffUpdated: () => void;
}

function EditStaffModal({ isOpen, staff, onClose, onStaffUpdated }: EditStaffModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    patronymic: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (staff && isOpen) {
      setFormData({
        name: staff.name || '',
        surname: staff.surname || '',
        patronymic: staff.patronymic || '',
        email: staff.email || '',
        phone: staff.phone || '',
        address: staff.address || '',
      });
    }
  }, [staff, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!staff) {
      setError('Сотрудник не выбран');
      setLoading(false);
      return;
    }

    try {
      await apiClient.put(`/api/staff/${staff.username}`, formData);
      onStaffUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при обновлении данных');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className="bg-surface-card relative transform overflow-hidden rounded-lg shadow-xl transition-all sm:my-10 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-border">
            <h2 className="text-lg font-bold font-main text-text-primary">Редактировать сотрудника</h2>
            <button
              onClick={handleClose}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Закрыть"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-error/10 border border-error rounded-lg text-error text-sm font-main">
                {error}
              </div>
            )}

            {/* Username (read-only) */}
            <div>
              <label className="block text-sm font-medium font-main text-text-secondary mb-1">
                Username
              </label>
              <input
                type="text"
                value={staff.username}
                disabled
                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-secondary font-main"
              />
            </div>

            {/* Name & Surname */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium font-main text-text-primary mb-1">
                  Имя *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium font-main text-text-primary mb-1">
                  Фамилия *
                </label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {/* Patronymic */}
            <div>
              <label className="block text-sm font-medium font-main text-text-primary mb-1">
                Отчество
              </label>
              <input
                type="text"
                value={formData.patronymic}
                onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium font-main text-text-primary mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium font-main text-text-primary mb-1">
                  Телефон *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium font-main text-text-primary mb-1">
                Адрес
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-surface-base border border-surface-border text-text-primary rounded-lg font-main hover:bg-surface-hover transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse rounded-lg font-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditStaffModal;