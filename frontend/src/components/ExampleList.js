import React from 'react'

const ExampleList = ({ examples, deleteExample }) => {

  const onClickDelete = (example) => () => {
    deleteExample(example)
  }

  const createKeyProp = () => {
    const key = Math.round((1 + (Math.random() * (9999 - 1))))
    return key
  }

  if (examples.length === 0) {
    return (
      <>
        <p>No Examples found.</p>
      </>
    )
  }
  return (
    <>
      {examples.map(example => {
        return (
          <div key={example._id} style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '70%', margin: 'auto' }}>
            <p>
              field1: <b>{example.field1}</b>
            </p>
            <p>
              field2: <b>{example.field2.toString()}</b>
            </p>
            <span>
              <button className='Button' onClick={onClickDelete(example)}> Delete </button>
            </span>
          </div>
        )
      }).reduce((acc, cur) => [...acc, <hr key={createKeyProp()} />, cur], [])}
    </>
  )
}

export default ExampleList