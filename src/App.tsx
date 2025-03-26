import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'react-calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  Lock, 
  UserPlus, 
  Edit, 
  Trash2, 
  Save,
  X as CloseIcon,
  Gift,
  PartyPopper,
  Users,
  LogOut,
  Settings
} from 'lucide-react';
import initialData from './data.json';
import { Friend, AppState, User } from './types';
import 'react-calendar/dist/Calendar.css';

function App() {
  const [state, setState] = useState<AppState>({
    currentUser: '',
    users: initialData.users,
    friends: initialData.friendsData.admin || [],
    isAuthenticated: false
  });
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(() => new Date().getMonth() + 1);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [newFriend, setNewFriend] = useState<Partial<Friend>>({
    name: '',
    birthday: '',
    hasGift: false,
    hasCongratulated: false
  });

  const formatDate = useCallback((dateStr: string) => {
    const [day, month] = dateStr.split('-');
    const date = new Date(2024, parseInt(month) - 1, parseInt(day));
    return format(date, 'd MMMM', { locale: ru });
  }, []);

  const saveToJSON = useCallback((newState: Partial<AppState>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    localStorage.setItem('birthdayApp', JSON.stringify({
      ...updatedState,
      friendsData: {
        ...JSON.parse(localStorage.getItem('birthdayApp') || '{}').friendsData || {},
        [updatedState.currentUser]: updatedState.friends
      }
    }));
  }, [state]);

  useEffect(() => {
    const saved = localStorage.getItem('birthdayApp');
    if (saved) {
      const data = JSON.parse(saved);
      setState(prev => ({
        ...prev,
        users: data.users || initialData.users,
        friends: [],
      }));
    }
  }, []);

  const handleLogin = useCallback(() => {
    const user = state.users.find(u => u.username === loginUsername && u.password === loginPassword);
    if (user) {
      const savedData = JSON.parse(localStorage.getItem('birthdayApp') || '{}');
      setState(prev => ({
        ...prev,
        currentUser: user.username,
        isAuthenticated: true,
        friends: savedData.friendsData?.[user.username] || []
      }));
      setLoginUsername('');
      setLoginPassword('');
    }
  }, [state.users, loginUsername, loginPassword]);

  const handleLogout = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentUser: '',
      isAuthenticated: false,
      friends: []
    }));
  }, []);

  const handleAddUser = useCallback(() => {
    if (newUsername && newPassword) {
      const newUser: User = {
        username: newUsername,
        password: newPassword,
        isAdmin: false
      };
      
      const updatedUsers = [...state.users, newUser];
      setState(prev => ({
        ...prev,
        users: updatedUsers
      }));
      
      localStorage.setItem('birthdayApp', JSON.stringify({
        ...JSON.parse(localStorage.getItem('birthdayApp') || '{}'),
        users: updatedUsers,
        friendsData: {
          ...JSON.parse(localStorage.getItem('birthdayApp') || '{}').friendsData,
          [newUsername]: []
        }
      }));
      
      setNewUsername('');
      setNewPassword('');
      setShowUserModal(false);
    }
  }, [newUsername, newPassword, state.users]);

  const handleUpdateUser = useCallback((user: User) => {
    if (user.username && user.password) {
      const oldUsername = editingUser?.username;
      const updatedUsers = state.users.map(u => 
        u.username === oldUsername ? user : u
      );
      
      setState(prev => ({
        ...prev,
        users: updatedUsers
      }));
      
      const savedData = JSON.parse(localStorage.getItem('birthdayApp') || '{}');
      if (oldUsername && oldUsername !== user.username) {
        savedData.friendsData[user.username] = savedData.friendsData[oldUsername];
        delete savedData.friendsData[oldUsername];
      }
      savedData.users = updatedUsers;
      
      localStorage.setItem('birthdayApp', JSON.stringify(savedData));
      setEditingUser(null);
    }
  }, [editingUser, state.users]);

  const handleChangePassword = useCallback(() => {
    if (newPassword) {
      const updatedUsers = state.users.map(u => 
        u.username === state.currentUser ? { ...u, password: newPassword } : u
      );
      setState(prev => ({ ...prev, users: updatedUsers }));
      localStorage.setItem('birthdayApp', JSON.stringify({
        ...JSON.parse(localStorage.getItem('birthdayApp') || '{}'),
        users: updatedUsers
      }));
      setNewPassword('');
    }
  }, [newPassword, state.currentUser, state.users]);

  const handleAddFriend = useCallback(() => {
    if (newFriend.name && newFriend.birthday) {
      const friend: Friend = {
        id: Date.now().toString(),
        name: newFriend.name,
        birthday: newFriend.birthday,
        hasGift: false,
        hasCongratulated: false
      };
      saveToJSON({ friends: [...state.friends, friend] });
      setNewFriend({ name: '', birthday: '', hasGift: false, hasCongratulated: false });
    }
  }, [newFriend, saveToJSON, state.friends]);

  const handleEditFriend = useCallback((friend: Friend) => {
    const updatedFriends = state.friends.map(f => 
      f.id === friend.id ? friend : f
    );
    saveToJSON({ friends: updatedFriends });
    setEditingFriend(null);
  }, [saveToJSON, state.friends]);

  const handleDeleteFriend = useCallback((id: string) => {
    saveToJSON({ friends: state.friends.filter(f => f.id !== id) });
  }, [saveToJSON, state.friends]);

  const toggleFriendAttribute = useCallback((friendId: string, attribute: 'hasGift' | 'hasCongratulated') => {
    const updatedFriends = state.friends.map(friend => {
      if (friend.id === friendId) {
        return { ...friend, [attribute]: !friend[attribute] };
      }
      return friend;
    });
    saveToJSON({ friends: updatedFriends });
  }, [saveToJSON, state.friends]);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(prevDate => 
      prevDate?.getTime() === date.getTime() ? null : date
    );
  }, []);

  const currentUser = state.users.find(u => u.username === state.currentUser);
  const isAdmin = currentUser?.isAdmin || false;

  const filteredFriends = selectedMonth !== null
    ? state.friends.filter(friend => {
        const month = parseInt(friend.birthday.split('-')[1]);
        return month === selectedMonth;
      })
    : state.friends;

  const getBirthdayDates = useCallback(() => {
    return state.friends.map(friend => {
      const [day, month] = friend.birthday.split('-');
      return new Date(2024, parseInt(month) - 1, parseInt(day));
    });
  }, [state.friends]);

  const getBirthdayFriends = useCallback((date: Date) => {
    return state.friends.filter(friend => {
      const [day, month] = friend.birthday.split('-');
      const birthDate = new Date(2024, parseInt(month) - 1, parseInt(day));
      return birthDate.getDate() === date.getDate() && 
             birthDate.getMonth() === date.getMonth();
    });
  }, [state.friends]);

  const renderBirthdayInfo = useCallback((date: Date) => {
    const friends = getBirthdayFriends(date);
    if (friends.length === 0) return null;

    return (
      <div 
        className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-[200px] md:w-[250px]"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {format(date, 'd MMMM', { locale: ru })}
            </h3>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-500 hover:text-gray-700 ml-4"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {friends.map(friend => (
          <div key={friend.id} className="text-sm py-1 flex items-center gap-2">
            <span>{friend.name}</span>
            <div className="flex gap-1">
              {friend.hasGift && <Gift className="w-4 h-4 text-green-500" />}
              {friend.hasCongratulated && <PartyPopper className="w-4 h-4 text-blue-500" />}
            </div>
          </div>
        ))}
      </div>
    );
  }, [getBirthdayFriends, selectedDate]);

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">Дни рождения</h1>
          <input
            type="text"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            placeholder="Имя пользователя"
            className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLogin();
              }
            }}
            placeholder="Пароль"
            className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  const UserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Добавить пользователя</h2>
          <button
            onClick={() => setShowUserModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="Имя пользователя"
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddUser}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Добавить
        </button>
      </div>
    </div>
  );

  const UserManagementModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Управление пользователями</h2>
          <button
            onClick={() => {
              setShowUserManagement(false);
              setEditingUser(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          {state.users.map((user) => (
            <div key={user.username} className="bg-gray-50 p-4 rounded-lg">
              {editingUser?.username === user.username ? (
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    placeholder="Имя пользователя"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="Новый пароль"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleUpdateUser(editingUser)}
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

  const PasswordChangeSection = () => (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Сменить пароль</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Новый пароль"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleChangePassword}
          className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Сменить пароль
        </button>
      </div>
    </div>
  );

  const MobileContent = () => (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Календарь дней рождения</h2>
        <div className="relative bg-white rounded-lg shadow p-4">
          <Calendar
            locale="ru-RU"
            className="w-full"
            tileClassName={({ date }) => {
              const birthdays = getBirthdayDates();
              const hasBirthday = birthdays.some(
                birthday =>
                  birthday.getDate() === date.getDate() &&
                  birthday.getMonth() === date.getMonth()
              );
              const isSelected = selectedDate?.getTime() === date.getTime();
              return `cursor-pointer ${hasBirthday ? 'bg-blue-500 text-white rounded-full' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`;
            }}
            onClickDay={handleDateClick}
            onMouseOver={({ target }) => {
              if (!selectedDate) {
                const date = new Date((target as HTMLElement).dateTime);
                const hasBirthday = getBirthdayFriends(date).length > 0;
                if (hasBirthday) {
                  setHoverDate(date);
                }
              }
            }}
            onMouseOut={() => {
              if (!selectedDate) {
                setHoverDate(null);
              }
            }}
          />
          {(selectedDate && renderBirthdayInfo(selectedDate)) || 
           (hoverDate && !selectedDate && renderBirthdayInfo(hoverDate))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Фильтр по месяцам</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(selectedMonth === month ? null : month)}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedMonth === month
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {format(new Date(2024, month - 1), 'LLLL', { locale: ru })}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Список друзей</h2>
        <div className="space-y-4">
          {filteredFriends.map((friend) => (
            <div key={friend.id} className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 sm:justify-between">
              {editingFriend?.id === friend.id ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <input
                      type="text"
                      value={editingFriend.name}
                      onChange={(e) => setEditingFriend(prev => ({ ...prev!, name: e.target.value }))}
                      className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={editingFriend.birthday}
                      onChange={(e) => setEditingFriend(prev => ({ ...prev!, birthday: e.target.value }))}
                      className="w-full sm:w-32 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleEditFriend(editingFriend)}
                      className="text-green-500 hover:text-green-600"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingFriend(null)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <CloseIcon className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <span className="font-medium">{friend.name}</span>
                    <span className="text-gray-600">{formatDate(friend.birthday)}</span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end items-center">
                    <button
                      onClick={() => toggleFriendAttribute(friend.id, 'hasGift')}
                      className={`p-1 rounded hover:bg-gray-200 ${friend.hasGift ? 'text-green-500' : 'text-gray-400'}`}
                      title={friend.hasGift ? 'Подарок куплен' : 'Подарок не куплен'}
                    >
                      <Gift className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleFriendAttribute(friend.id, 'hasCongratulated')}
                      className={`p-1 rounded hover:bg-gray-200 ${friend.hasCongratulated ? 'text-blue-500' : 'text-gray-400'}`}
                      title={friend.hasCongratulated ? 'Поздравление отправлено' : 'Не поздравлен'}
                    >
                      <PartyPopper className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingFriend(friend)}
                      className="text-blue-500 hover:text-blue-600 p-1 rounded hover:bg-gray-200"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFriend(friend.id)}
                      className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-gray-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Добавить друга</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={newFriend.name}
            onChange={(e) => setNewFriend(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Имя друга"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-4">
            <input
              type="text"
              value={newFriend.birthday}
              onChange={(e) => setNewFriend(prev => ({ ...prev, birthday: e.target.value }))}
              placeholder="ДД-ММ"
              className="w-32 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddFriend}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Добавить
            </button>
          </div>
        </div>
      </div>

      <PasswordChangeSection />
    </>
  );

  const DesktopContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Добавить друга</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newFriend.name}
              onChange={(e) => setNewFriend(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Имя друга"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newFriend.birthday}
              onChange={(e) => setNewFriend(prev => ({ ...prev, birthday: e.target.value }))}
              placeholder="ДД-ММ"
              className="w-full sm:w-32 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddFriend}
              className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Добавить
            </button>
          </div>
        </div>

        <PasswordChangeSection />

        <div>
          <h2 className="text-xl font-semibold mb-4">Фильтр по месяцам</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(selectedMonth === month ? null : month)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  selectedMonth === month
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {format(new Date(2024, month - 1), 'LLLL', { locale: ru })}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Список друзей</h2>
          <div className="space-y-4">
            {filteredFriends.map((friend) => (
              <div key={friend.id} className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 sm:justify-between">
                {editingFriend?.id === friend.id ? (
                  <>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      <input
                        type="text"
                        value={editingFriend.name}
                        onChange={(e) => setEditingFriend(prev => ({ ...prev!, name: e.target.value }))}
                        className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={editingFriend.birthday}
                        onChange={(e) => setEditingFriend(prev => ({ ...prev!, birthday: e.target.value }))}
                        className="w-full sm:w-32 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleEditFriend(editingFriend)}
                        className="text-green-500 hover:text-green-600"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingFriend(null)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <CloseIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <span className="font-medium">{friend.name}</span>
                      <span className="text-gray-600">{formatDate(friend.birthday)}</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end items-center">
                      <button
                        onClick={() => toggleFriendAttribute(friend.id, 'hasGift')}
                        className={`p-1 rounded hover:bg-gray-200 ${friend.hasGift ? 'text-green-500' : 'text-gray-400'}`}
                        title={friend.hasGift ? 'Подарок куплен' : 'Подарок не куплен'}
                      >
                        <Gift className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleFriendAttribute(friend.id, 'hasCongratulated')}
                        className={`p-1 rounded hover:bg-gray-200 ${friend.hasCongratulated ? 'text-blue-500' : 'text-gray-400'}`}
                        title={friend.hasCongratulated ? 'Поздравление отправлено' : 'Не поздравлен'}
                      >
                        <PartyPopper className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setEditingFriend(friend)}
                        className="text-blue-500 hover:text-blue-600 p-1 rounded hover:bg-gray-200"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFriend(friend.id)}
                        className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-gray-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Календарь дней рождения</h2>
        <div className="relative bg-white rounded-lg shadow p-4">
          <Calendar
            locale="ru-RU"
            className="w-full"
            tileClassName={({ date }) => {
              const birthdays = getBirthdayDates();
              const hasBirthday = birthdays.some(
                birthday =>
                  birthday.getDate() === date.getDate() &&
                  birthday.getMonth() === date.getMonth()
              );
              const isSelected = selectedDate?.getTime() === date.getTime();
              return `cursor-pointer ${hasBirthday ? 'bg-blue-500 text-white rounded-full' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`;
            }}
            onClickDay={handleDateClick}
            onMouseOver={({ target }) => {
              if (!selectedDate) {
                const date = new Date((target as HTMLElement).dateTime);
                const hasBirthday = getBirthdayFriends(date).length > 0;
                if (hasBirthday) {
                  setHoverDate(date);
                }
              }
            }}
            onMouseOut={() => {
              if (!selectedDate) {
                setHoverDate(null);
              }
            }}
          />
          {(selectedDate && renderBirthdayInfo(selectedDate)) || 
           (hoverDate && !selectedDate && renderBirthdayInfo(hoverDate))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Дни рождения</h1>
              <span className="text-gray-500">({state.currentUser})</span>
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <>
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Добавить пользователя
                  </button>
                  <button
                    onClick={() => setShowUserManagement(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Управление пользователями
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            </div>
          </div>

          <div className="block lg:hidden">
            <MobileContent />
          </div>
          <div className="hidden lg:block">
            <DesktopContent />
          </div>
        </div>
      </div>
      {showUserModal && <UserModal />}
      {showUserManagement && <UserManagementModal />}
    </div>
  );
}

export default App;