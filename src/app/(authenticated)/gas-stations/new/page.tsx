// src/app/gas-stations/new/page.tsx
'use client';

import { GasStationForm } from '@/components/gas-stations/StationForm';

export default function NewGasStationPage() {
  return <GasStationForm mode="create" />;
}