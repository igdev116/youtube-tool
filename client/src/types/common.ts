export interface DefaultResponse {
  statusCode: number;
  success: boolean;
  message?: string;
}

export interface BaseResponse<T> extends DefaultResponse {
  result: T | null;
}

export interface PagingParams {
  page?: number;
  limit: number;
}

export interface CursorPagingParams {
  limit: number;
  cursor?: string;
}

export interface PagingResponse<T> extends DefaultResponse {
  result: {
    content: T[];
    paging: {
      cursor?: string | null;
      hasMore: boolean;
      total: number;
    };
  };
}

export interface PagingResponseV2<T> extends DefaultResponse {
  result: {
    content: T[];
    paging: {
      total: number;
      hasMore: boolean;
    };
  };
}
