import { useState } from 'react'
import TestBuilder from '../components/test/TestBuilder'
import TestSheet from '../components/test/TestSheet'
import type { GeneratedTest } from '../components/test/testTypes'

export default function TestPage() {
  const [test, setTest] = useState<GeneratedTest | null>(null)

  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">
      <div>
        <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">
          Test Generator
        </h2>
        <p className="font-mono text-xs text-dim mt-1">
          {test
            ? 'Answer each question below, then check your score or export a printable version.'
            : 'Select topics, set question counts, and generate a practice test.'}
        </p>
      </div>

      {test === null
        ? <TestBuilder onGenerate={setTest} />
        : <TestSheet test={test} onBack={() => setTest(null)} />
      }
    </div>
  )
}
