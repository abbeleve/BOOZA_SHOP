import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import AdministrationHeader from "@/components/administration/AdministraionHeader";
import { BeatLoader } from "react-spinners";
import apiClient from '@/api/client';
import AddStaffModal from '@/components/administration/AddStaffModal';
import EditStaffModal from '@/components/administration/EditStaffModal';
import ChangePasswordModal from '@/components/administration/ChangePasswordModal';
import { adminHeaderItems } from "@/config/admin";


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

function StaffControlPage() {
  const { user } = useUser();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Модальные окна
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const fetchStaff = async () => {
    try {
      const response = await apiClient.get<StaffMember[]>('/api/staff/');
      const allStaff = response.data.filter(member => 
        member.role === 'STAFF' || member.role === 'ADMIN'
      );
      setStaff(allStaff);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка при загрузке персонала');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (username: string) => {
    if (!confirm(`Удалить сотрудника ${username}?`)) return;
    try {
      await apiClient.delete(`/api/staff/${username}`);
      await fetchStaff();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка при удалении');
    }
  };

  const handleEdit = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsEditModalOpen(true);
  };

  const handleChangePassword = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsPasswordModalOpen(true);
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
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold font-main text-text-primary mb-2">Управление персоналом</h1>
              <p className="text-text-secondary font-main">Добавление и редактирование сотрудников</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-text-inverse rounded-lg font-main font-medium transition-colors"
            >
              + Добавить сотрудника
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <BeatLoader color="var(--color-accent)" />
            </div>
          ) : error ? (
            <div className="p-4 bg-error/10 border border-error rounded-lg text-error text-sm font-main">
              {error}
              <button onClick={fetchStaff} className="ml-4 underline hover:no-underline">Повторить</button>
            </div>
          ) : (
            <div className="bg-surface-card rounded-xl shadow-sm border border-surface-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface-base border-b border-surface-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">ФИО</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Роль</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Телефон</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-text-secondary">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {staff.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-text-secondary font-main">
                        Сотрудников не найдено
                      </td>
                    </tr>
                  ) : (
                    staff.map((member) => (
                      <tr key={member.username} className="hover:bg-surface-base transition-colors">
                        <td className="px-6 py-4 text-sm text-text-primary font-main">{member.username}</td>
                        <td className="px-6 py-4 text-sm text-text-primary font-main">
                          {member.surname} {member.name} {member.patronymic}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            member.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-accent-light text-accent'
                          }`}>
                            {member.role === 'ADMIN' ? '👑 Администратор' : '👤 Сотрудник'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary font-main">{member.email}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary font-main">{member.phone}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-accent hover:text-accent-hover mr-3"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleChangePassword(member)}
                            className="text-text-secondary hover:text-text-primary mr-3"
                          >
                            Пароль
                          </button>
                          <button
                            onClick={() => handleDelete(member.username)}
                            className="text-error hover:text-error/80"
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Модальные окна */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStaffAdded={fetchStaff}
      />
      
      <EditStaffModal
        isOpen={isEditModalOpen}
        staff={selectedStaff}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStaff(null);
        }}
        onStaffUpdated={fetchStaff}
      />
      
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        username={selectedStaff?.username || ''}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setSelectedStaff(null);
        }}
      />
    </div>
  );
}

export default StaffControlPage;