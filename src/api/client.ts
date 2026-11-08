export const BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:8080'

// ===== 공통: 서버 에러 메시지 꺼내기 =====
export const readError = async (res: Response) => {
  try {
    const d = await res.json();
    return d?.message || `오류 코드 ${res.status}`;
  } catch {
    return `오류 코드 ${res.status}`;
  }
};

export const authHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' };
};

export const toServerPriority = (p: string) => (p === 'normal' ? 'MEDIUM' : String(p || 'normal').toUpperCase());
