export type UseAuthReturn = {
  token: string | null;
  role: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};
