import React from 'react';
import { Gift, PartyPopper, Edit, Trash2, Save, X as CloseIcon } from 'lucide-react';
import { Friend } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface FriendListProps {
  friends: Friend[];
  editingFriend: Friend | null;
  onEditFriend: (friend: Friend) => void;
  onDeleteFriend: (id: string) => void;
  onToggleAttribute: (id: string, attribute: 'hasGift' | 'hasCongratulated') => void;
  setEditingFriend: (friend: Friend | null) => void;
}

export const FriendList: React.FC<FriendListProps> = ({
  friends,
  editingFriend,
  onEditFriend,
  onDeleteFriend,
  onToggleAttribute,
  setEditingFriend
}) => (
  <div className="space-y-4">
    {friends.map((friend) => (
      <div key={friend.id} className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 sm:justify-between">
        {editingFriend?.id === friend.id ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <input
                type="text"
                value={editingFriend.name}
                onChange={(e) => setEditingFriend({ ...editingFriend, name: e.target.value })}
                className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={editingFriend.birthday}
                onChange={(e) => setEditingFriend({ ...editingFriend, birthday: e.target.value })}
                className="w-full sm:w-32 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => onEditFriend(editingFriend)}
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
                onClick={() => onToggleAttribute(friend.id, 'hasGift')}
                className={`p-1 rounded hover:bg-gray-200 ${friend.hasGift ? 'text-green-500' : 'text-gray-400'}`}
              >
                <Gift className="w-5 h-5" />
              </button>
              <button
                onClick={() => onToggleAttribute(friend.id, 'hasCongratulated')}
                className={`p-1 rounded hover:bg-gray-200 ${friend.hasCongratulated ? 'text-blue-500' : 'text-gray-400'}`}
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
                onClick={() => onDeleteFriend(friend.id)}
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
);
