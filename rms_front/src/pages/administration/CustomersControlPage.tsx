import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import AdministrationHeader from "@/components/administration/AdministraionHeader";
import { BeatLoader } from "react-spinners";
import apiClient from '@/api/client';
import { adminHeaderItems } from '@/config/main';

interface Customer {
  user_id: number;
  username: string;
  name: string;
  surname: string;
  patronymic?: string;
  email: string;
  phone: string;
  address?: string;
}

function CustomersControlPage() {
  const { user } = useUser();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async (search?: string) => {
    try {
      const params = search ? { search } : {};
      const response = await apiClient.get<Customer[]>('/api/users/customers', { params });
      setCustomers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при загрузке клиентов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchQuery);
  };

  const isAdmin = user?.is_staff || user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-4xl font-bold font-main text-text-primary mb-4">Доступ запрещён</h1>
        <p className="text-lg text-text-secondary font-main text-center mb-8 max-w-md">
          Извините, у вас недостаточно прав для доступа к этой странице.
        </p>
        <a href="/admin/menu" className="bg-accent hover:bg-accent-hover text-text-inverse font-main font-medium py-3 px-6 rounded-lg transition-colors">
          Вернуться в админку
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdministrationHeader items={adminHeaderItems} />
      <main className="py-10">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-main text-text-primary mb-2">Клиенты</h1>
            <p className="text-text-secondary font-main">Список всех клиентов ресторана</p>
          </div>

          <form onSubmit={handleSearch} className="mb-6 flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени, email или телефону..."
              className="flex-1 px-4 py-3 bg-surface-card border border-surface-border rounded-lg text-text-primary font-main focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-text-inverse rounded-lg font-main font-medium transition-colors"
            >
              Найти
            </button>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); fetchCustomers(); }}
              className="px-6 py-3 bg-surface-base border border-surface-border text-text-primary rounded-lg font-main font-medium hover:bg-surface-hover transition-colors"
            >
              Сбросить
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <BeatLoader color="var(--color-accent)" />
            </div>
          ) : error ? (
            <div className="p-4 bg-error/10 border border-error rounded-lg text-error text-sm font-main">
              {error}
              <button onClick={() => fetchCustomers()} className="ml-4 underline hover:no-underline">Повторить</button>
            </div>
          ) : (
            <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface-base border-b border-surface-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">ФИО</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Телефон</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Адрес</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-text-secondary font-main">
                        Клиенты не найдены
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.user_id} className="hover:bg-surface-base transition-colors">
                        <td className="px-6 py-4 text-sm text-text-primary font-main">{customer.username}</td>
                        <td className="px-6 py-4 text-sm text-text-primary font-main">
                          {customer.surname} {customer.name} {customer.patronymic}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary font-main">{customer.email}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary font-main">{customer.phone}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary font-main">{customer.address || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default CustomersControlPage;