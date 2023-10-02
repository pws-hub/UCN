import React from 'react'

export default ( props ) => {
  props.status = 'Red'

  const handleClick = () => {
    props.status = 'Green'
  }

  return (<div>
    Flag Status:{props.status}

      <button onClick={handleClick}>Change Status</button>
  </div>)
}