import React from 'react'
import './limit.css'

function Limit() {
	return (
		<div id='limit-container' className='limit-container'>
			<label className='limit-label'>Limit depth to:</label>
			<input id='limit-input' className='limit-input' type="text" placeholder='Enter a limit' defaultValue='2' autoComplete='off'/>
		</div>
	)
}

export default Limit