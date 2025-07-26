export interface DefaultResponse {
  statusCode: number;
  success: boolean;
  message?: string;
}

export interface BaseResponse<T> extends DefaultResponse {
  result: T | null;
}

export interface PagingParams {
  limit: number;
  cursor?: string;
}

export interface PagingResponse<T> extends DefaultResponse {
  result: {
    content: T[];
    paging: {
      cursor?: string | null;
      hasMore: boolean;
    };
  };
}
