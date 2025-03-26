export interface Friend {
  id: string;
  name: string;
  birthday: string; // Format: "MM-DD"
  hasGift: boolean;
  hasCongratulated: boolean;
}

export interface User {
  username: string;
  password: string;
  isAdmin: boolean;
}

export interface AppState {
  currentUser: string;
  users: User[];
  friends: Friend[];
  isAuthenticated: boolean;
}