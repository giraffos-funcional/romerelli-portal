import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guias de Despacho',
};

export default function DispatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
