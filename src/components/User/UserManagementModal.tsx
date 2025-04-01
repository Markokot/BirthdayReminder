import React from 'react';
import { Save, X as CloseIcon, Edit } from 'lucide-react';
import { User } from '../../types';

interface UserManagementModalProps {
  users: User[];
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  users,
  editingUser,
  setEditingUser,
  onUpdateUser,
  onClose
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Управление пользователями</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.username} className="bg-gray-50 p-4 rounded-lg">
            {editingUser?.username === user.username ? (
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onUpdateUser(editingUser)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Сохранить
                  </button>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <CloseIcon className="w-4 h-4" /> Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{user.username}</span>
                  {user.isAdmin && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Администратор
                    </span>
                  )}
                </div>
                {!user.isAdmin && (
                  <button
                    onClick={() => setEditingUser(user)}
                    className="text-blue-500 hover:text-blue-600 p-2 rounded hover:bg-gray-200"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);
