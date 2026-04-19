import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mis Facturas',
};

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
