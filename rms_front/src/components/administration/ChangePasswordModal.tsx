import { useState } from 'react';
import apiClient from '@/api/client';

interface ChangePasswordModalProps {
  isOpen: boolean;
  username: string;
  onClose: () => void;
}

function ChangePasswordModal({ isOpen, username, onClose }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.new_password !== formData.confirm_password) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      setLoading(false);
      return;
    }

    try {
      await apiClient.post(`/api/staff/${username}/change-password`, {
        old_password: formData.old_password,
        new_password: formData.new_password,
      });
      onClose();
      setFormData({ old_password: '', new_password: '', confirm_password: '' });
      alert('Пароль успешно изменён');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при изменении пароля');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ old_password: '', new_password: '', confirm_password: '' });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className='flex min-h-full items-center justify-center p-4'>
        <div className="bg-surface-card relative transform overflow-hidden rounded-lg shadow-xl transition-all sm:my-10 sm:w-full sm:max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-border">
            <h2 className="text-lg font-bold font-main text-text-primary">Сменить пароль</h2>
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
                Сотрудник
              </label>
              <input
                type="text"
                value={username}
                disabled
                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-secondary font-main"
              />
            </div>

            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium font-main text-text-primary mb-1">
                Текущий пароль *
              </label>
              <input
                type="password"
                value={formData.old_password}
                onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                required
                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="••••••••"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium font-main text-text-primary mb-1">
                Новый пароль *
              </label>
              <input
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium font-main text-text-primary mb-1">
                Подтвердите пароль *
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-surface-base border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="••••••••"
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

export default ChangePasswordModal;