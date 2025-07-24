export const formatDate = (date: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Vừa xong';
  } else if (diffInHours < 24) {
    return `${diffInHours}h trước`;
  } else if (diffInHours < 48) {
    return 'Hôm qua';
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  }
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const highlightText = (text: string, highlights?: string[]): string => {
  if (!highlights || highlights.length === 0) {
    return text;
  }
  
  let highlightedText = text;
  highlights.forEach(highlight => {
    const regex = new RegExp(`(${highlight})`, 'gi');
    highlightedText = highlightedText.replace(
      regex, 
      '<span class="bg-yellow-200 text-yellow-800 px-1 rounded font-medium">$1</span>'
    );
  });
  
  return highlightedText;
};
