import axios from '../util/apiClient'
import React, { useEffect, useState } from 'react'
import ExampleList from './ExampleList'

const Main = () => {

  const [examples, setExamples] = useState([])

  const refreshExamples = async () => {
    const { data } = await axios.get('/examples')
    setExamples(data)
  }

  const deleteExample = async (example) => {
    await axios.delete(`/examples/${example._id}`)
    refreshExamples()
  }

  useEffect(() => {
    refreshExamples()
  }, [])

  return (
    <div className='Container'>
      <h1>Bill splitter</h1>
      <p>A good starting point for any React app – containerized edition</p>
      <h3>Current Examples in the mongo database:</h3>
      <ExampleList examples={examples} deleteExample={deleteExample} />
    </div>
  )
}

export default Main
