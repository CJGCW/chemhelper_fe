import { createContext, useContext } from 'react'

/** When true, ExampleBox renders nothing (used in practice mode). */
export const HideExamplesContext = createContext(false)
export const useHideExamples = () => useContext(HideExamplesContext)
