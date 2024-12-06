export const getFormattedDate = () => {
  const now = new Date();
  const koreanTime = new Date(now.setHours(now.getHours()));
  const year = koreanTime.getFullYear();
  const month = String(koreanTime.getMonth() + 1).padStart(2, '0');
  const day = String(koreanTime.getDate()).padStart(2, '0');
  const hours = String(koreanTime.getHours()).padStart(2, '0');
  const minutes = String(koreanTime.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
