---
alwaysApply: true
---

# Project Rules for Cursor AI

Áp dụng cho cả hai folder `admin/` và `client/` trong dự án.

---

## Project Structure

### `@components`

- Chứa các components dùng chung trong toàn bộ dự án.

### `@constants`

- Chứa các hằng số (constants) của dự án.
- Ưu tiên sử dụng `enum` để định nghĩa.

### `@types`

- Chứa các type definitions tương ứng cho từng service.
- Mỗi file đặt tên theo domain, ví dụ: `user.ts`.

#### Naming convention:

- Component Props interfaces: `Props`
- API params: `Get[Resource][Action]Params` (ví dụ: `GetProductDetailParams`)
- API results: `Get[Resource][Action]Result` (ví dụ: `GetProductDetailResult`)
- Response types: `BaseResponse<T>`, `PagingResponse<T>`
- Response sẽ được bọc trong `BaseResponse<T>` hoặc `PagingResponse<T>` tùy trường hợp.

### Variable naming for React Query hooks

- Không destructure trực tiếp từ hook. Luôn gán **toàn bộ object** trả về của hook vào một biến có tên theo chuẩn.
- Quy tắc đặt tên biến:
  - `useQuery[Action][Resource]` → biến: `query[Action][Resource]`
  - `useInfiniteQuery[Action][Resource]` → biến: `infiniteQuery[Action][Resource]`
  - `useMutation[Action][Resource]` → biến: `mutation[Action][Resource]`
- Ví dụ:

  ```typescript
  // useQuery
  const queryGetProductDetail = useQueryGetProductDetail(params);
  // Sử dụng
  queryGetProductDetail.data;
  queryGetProductDetail.isLoading;

  // useInfiniteQuery
  const infiniteQueryGetListProducts = useInfiniteQueryGetListProducts(params);
  // Sử dụng
  infiniteQueryGetListProducts.data;
  infiniteQueryGetListProducts.isLoading;
  infiniteQueryGetListProducts.fetchNextPage();

  // useMutation
  const mutationCreateAffLink = useMutationCreateAffLink();
  // Sử dụng
  mutationCreateAffLink.mutate(payload);
  mutationCreateAffLink.isPending;
  mutationCreateAffLink.reset();
  ```

### `@hooks`

- Mỗi service sẽ có một hook tương ứng, ví dụ: `useUserService.ts`.

### `@utils`

- Chứa các hàm tiện ích (utility functions).
- Các hàm dùng chung thì tách riêng file theo chức năng.
- Nếu không rõ, gom tất cả vào `@utils/index.ts`.

---

## Service & Hooks Patterns

### Service structure

```typescript
import { BaseResponse } from '~/types/common';
import { Params, Result } from '~/types/typeName';
import { httpRequest } from '~/utils';

export default {
  getResource(params: Params): Promise<BaseResponse<Result>> {
    return httpRequest.get('/api/endpoint', { params });
  },
  createResource(params: Params): Promise<BaseResponse<Result>> {
    return httpRequest.post('/api/endpoint', params);
  },
  updateResource(params: Params): Promise<BaseResponse<Result>> {
    return httpRequest.put('/api/endpoint', params);
  },
  deleteResource(params: Params): Promise<BaseResponse<Result>> {
    return httpRequest.delete('/api/endpoint', { params });
  },
};
```

### Custom hooks structure

```typescript
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import { service } from '~/services/serviceName';
import { Params, Result } from '~/types/typeName';

export const useServiceName = (queryClient = new QueryClient()) => {
  const useQueryGetResource = (params: Params) => {
    return useQuery({
      queryKey: ['key', 'action', params],
      queryFn: () => service.getResource(params),
    });
  };

  const useMutationCreateResource = () => {
    return useMutation({
      mutationFn: service.createResource,
    });
  };

  const prefetchQueryGetResource = async (params: Params) => {
    await queryClient.prefetchQuery({
      queryKey: ['key', 'action', params],
      queryFn: () => service.getResource(params),
    });
  };

  return {
    useQueryGetResource,
    useMutationCreateResource,
    prefetchQueryGetResource,
  };
};
```

---

## Query Keys

### Đặt trong file:

```typescript
const userKeys = {
  key: 'Users' as const,
  getUserDetail: (params: GetUserDetailParams) =>
    [userKeys.key, 'getUserDetail', params] as const,
  getListUsers: (params: GetListUsersParams) =>
    [userKeys.key, 'getListUsers', params] as const,
};
```

- Các hàm `useMutation` không cần define key.

---

## useQuery & useInfiniteQuery pattern

**Đặt tên custom hook:**

- `useQuery[Action][Resource]` (ví dụ: `useQueryGetProductDetail`, `useQueryGetListCategories`)
- `useInfiniteQuery[Action][Resource]` (ví dụ: `useInfiniteQueryGetListProductsByCategory`)

**Query key:**

- Luôn sử dụng object key chuẩn (ví dụ: `productKeys`, `resourceKeys`) để sinh query key.
- Query key là một mảng: `[domain, action, params]`.
- Định nghĩa các hàm sinh key trong object:

```typescript
export const productKeys = {
  key: 'products' as const,
  getProductDetail: (params) =>
    [productKeys.key, 'getProductDetail', params] as const,
};
```

**Cách wrap service function:**

- Luôn wrap service function tương ứng, không thêm logic thừa.
- Truyền params vào queryFn.
- Trả về object của React Query.

**Ví dụ:**

```typescript
const useQueryGetProductDetail = (params: GetProductDetailParams) => {
  return useQuery({
    queryKey: productKeys.getProductDetail(params),
    queryFn: () => productsService.getProductDetail(params),
  });
};

const useInfiniteQueryGetListProductsByCategory = (
  params: GetListProductsByCategoryParams
) => {
  return useInfiniteQuery({
    queryKey: productKeys.getListProductsByCategory(params),
    queryFn: ({ pageParam = 0 }) =>
      productsService.getListProductsByCategory({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.result?.paging?.nextPage ?? null,
  });
};
```

---

## useMutation pattern

- Đặt tên hook mutation theo pattern: `useMutation[Action][Resource]`
  (ví dụ: `useMutationCreateAffLink`, `useMutationGetProductDetail`)
- Chỉ wrap mutationFn từ service, không thêm logic phức tạp vào hook.
- Trả về object mutation của React Query để sử dụng các thuộc tính như `mutate`, `isPending`, `onSuccess`, ...

**Ví dụ:**

```typescript
const useMutationCreateAffLink = () => {
  return useMutation({
    mutationFn: productsService.createAffLink,
  });
};
```

---

## Styling Convention

- Không dùng template string để nối class names:

```typescript
className={`btn ${isActive ? 'btn-active' : ''}`}
```

- Thay vào đó, dùng hàm `cn` từ `@utils`:

```typescript
className={cn('btn', isActive && 'btn-active')}
```
