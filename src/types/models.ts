export type Create<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type Update<T> = Partial<Create<T>>;
