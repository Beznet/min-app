import React, { useState } from 'react'

const ItemForm = ({saveItem}) => {

  console.log(saveItem)
  const [value, setValue] = useState('');

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveItem(value);
        }}
      >
          <input 
            id="inputItem"
            placeholder="item input"
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
      </form>
    </div>
  )
}

export default ItemForm