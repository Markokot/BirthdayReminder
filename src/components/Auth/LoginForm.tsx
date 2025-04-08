
import React from 'react';
import { Lock, LogOut } from 'lucide-react';

interface LoginFormProps {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  currentUser: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onLogin,
  onLogout,
  isAuthenticated,
  currentUser
}) => {
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-gray-500">({currentUser})</span>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <Lock className="w-12 h-12 text-blue-500" />
      </div>
      <h1 className="text-2xl font-bold text-center mb-6">Дни рождения</h1>
      <div className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Имя пользователя"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onLogin()}
          placeholder="Пароль"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={onLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Войти
        </button>
      </div>
    </div>
  );
};
