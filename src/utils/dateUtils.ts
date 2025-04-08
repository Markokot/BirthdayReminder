import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (dateStr: string) => {
  const [day, month] = dateStr.split('-');
  const date = new Date(2024, parseInt(month) - 1, parseInt(day));
  return format(date, 'd MMMM', { locale: ru });
};

export const getBirthdayDates = (friends: { birthday: string }[]) => {
  const currentYear = new Date().getFullYear();
  return friends.map(friend => {
    const [day, month] = friend.birthday.split('-');
    return new Date(currentYear, parseInt(month) - 1, parseInt(day));
  });
};
