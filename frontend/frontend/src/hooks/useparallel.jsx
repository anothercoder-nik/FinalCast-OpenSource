import React, { useState } from 'react'

const useparallel = () => {
    
const [scrollY , setScroll] = useState(0);

const handleScroll = () => {
    // Add your scroll logic here
    setScroll(window.scrollY);
}

return scrollY;
}


export default useparallel
