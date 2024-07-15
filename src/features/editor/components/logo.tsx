import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Logo = () => {
  return (
    <Link href="/">
        <div className='size-48 relative shrink-0'>
            <Image src={"/canvassy-logo.svg"} alt='Logo' fill className=' shrink-0 hover:opacity-75 transition' />
        </div>
    </Link>
  )
}

export default Logo