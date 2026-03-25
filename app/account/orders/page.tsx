'use client';

import { Suspense } from 'react';
import OrdersPage from '@/components/account/orders-page';

export default function Orders() {
  return (
    <Suspense>
      <OrdersPage />
    </Suspense>
  );
}
