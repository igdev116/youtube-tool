export interface BaseResponse<T> {
  statusCode?: number;
  message: string;
  result: T | null;
  success: boolean;
}

export interface PagingResponse<T> {
  result: {
    content: T[];
    paging: {
      cursor?: string;
      hasMore?: boolean;
      total?: number;
    };
  };
  message: string;
}
