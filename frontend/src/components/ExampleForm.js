import React, { useState } from 'react'

const ExampleForm = ({ createExample }) => {
  const [field1, setField1] = useState('')
  const [field2, setField2] = useState('')

  const onChangeField1 = ({ target }) => {
    setField1(target.value)
  }

  const onChangeField2 = ({ target }) => {
    setField2(target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    createExample({ field1, field2 })
    setField1('')
    setField2('')
  }

  return (
    <div className='ExampleForm'>
      <p>Add an Example to the mongo database</p>
      <form onSubmit={handleSubmit}>
        <input className='Input' type="text" placeholder='Statement' name="text" value={field1} onChange={onChangeField1} />
        <br></br>
        <input className='Input' type="text" placeholder='true / false' name="text" value={field2} onChange={onChangeField2} />
        <br></br>
        <button className='Button' type="submit"> Submit </button>
      </form>
    </div>
  )
}

export default ExampleForm