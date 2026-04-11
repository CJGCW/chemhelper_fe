import RedoxPractice from '../components/redox/RedoxPractice'

export default function RedoxPracticePage() {
  return (
    <div className="pl-4 pr-4 md:pl-6 md:pr-8 lg:pl-8 lg:pr-12 py-4 md:py-6 lg:py-8 w-full flex flex-col gap-6 lg:gap-8">
      <h2 className="font-sans font-semibold text-bright text-xl lg:text-2xl">Redox Practice</h2>
      <RedoxPractice />
    </div>
  )
}
