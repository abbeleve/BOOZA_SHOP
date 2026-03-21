import { Link } from 'react-router-dom';

function AccessDeniedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <h1 className="text-4xl font-bold font-main text-text-primary mb-4">
                Доступ запрещён
            </h1>
            <p className="text-lg text-text-secondary font-main text-center mb-8 max-w-md">
                Извините, у вас недостаточно прав для доступа к этой странице.
            </p>
            <Link
                to="/"
                className="bg-accent hover:bg-accent-hover text-text-inverse font-main font-medium py-3 px-6 rounded-lg transition-colors"
            >
                Вернуться на главную
            </Link>
        </div>
    );
}

export default AccessDeniedPage;
