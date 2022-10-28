import React from 'react'
import axios from '../util/apiClient'

import ExampleForm from './ExampleForm'

const ExampleView = () => {

  const createExample = async (example) => {
    await axios.post('/examples', example)
  }

  return (
    <>
      <ExampleForm createExample={createExample} />
    </>
  )
}

export default ExampleView