import Link from 'next/link'

export default function NotFound() {
  return (
    <section className='w-full h-screen grid place-items-center'>
      <div className='text-center space-y-2'>
        <h2 className='text-4xl font-bold'>Not Found 😔</h2>
        <p className='text-2xl'>Could not find requested page</p>
        <Link href="/" className='text-[#0f93a5] text-xl font-semibold'>Return Home</Link>
      </div>
    </section>
  )
}