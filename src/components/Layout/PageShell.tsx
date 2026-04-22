import type { ReactNode } from 'react'

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">
      {children}
    </div>
  )
}

export function SectionHead({ label }: { label: string }) {
  return <h3 className="font-mono text-xs text-secondary tracking-widest uppercase">{label}</h3>
}
