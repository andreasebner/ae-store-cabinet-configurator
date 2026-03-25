'use client';

import { Suspense } from 'react';
import LoginPage from '@/components/account/login-page';

export default function Login() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
