interface NormalizePaginationParams<T> {
  data: T[];
  count: number;
  skip?: number;
  take: number;
}

export function pagination<T>({
  data,
  count,
  skip = 0,
  take,
}: NormalizePaginationParams<T>) {
  const page = Math.floor((skip + take) / take);
  const hasNextPage = count > skip + take;
  const hasPrevPage = skip > 0;

  return {
    data,
    hasNextPage,
    hasPrevPage,
    limit: take,
    nextPage: hasNextPage ? page + 1 : null,
    page,
    prevPage: hasPrevPage ? page - 1 : null,
    total: count,
    totalPages: Math.ceil(count / take),
  };
}
