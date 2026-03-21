import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { BeatLoader } from 'react-spinners';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'staff' | 'admin';
}

function ProtectedRoute({ children, requiredRole = 'staff' }: ProtectedRouteProps) {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <BeatLoader color="var(--color-accent)" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Проверка на staff или root (admin) роль
    const hasStaffRole = user.is_staff || user.role === 'staff' || user.role === 'admin';

    if (!hasStaffRole) {
        return <Navigate to="/access-denied" replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
