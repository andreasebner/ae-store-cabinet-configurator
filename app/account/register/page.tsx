'use client';

import { Suspense } from 'react';
import RegisterPage from '@/components/account/register-page';

export default function Register() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  );
}
