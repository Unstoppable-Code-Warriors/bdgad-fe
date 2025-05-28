import { useNavigate } from 'react-router'
import { Button } from '@mantine/core'
import { useForm } from '@mantine/form'
const Login = () => {
    const navigate = useNavigate()
    const form = useForm({
        initialValues: {
            email: '',
            password: ''
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            password: (value) => (value.length < 6 ? 'Password should be at least 6 characters' : null)
        }
    })
    const handleSubmit = (values: typeof form.values) => {
        navigate('/dashboard')
    }
    return (
        <div className='flex h-screen'>
            {/* Left Side */}
            <div className='flex-1 bg-gradient-to-br from-blue-500 to-blue-800 flex flex-col justify-between p-12 text-white'>
                <div>
                    <div className='mb-8'>
                        <div className='w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl'>
                            ✷
                        </div>
                    </div>
                    <h1 className='text-5xl font-light mb-6'>
                        Hello <br />
                        SaleSkip! <span className='text-4xl'>👋</span>
                    </h1>
                    <p className='text-lg opacity-90 max-w-md'>
                        Skip repetitive and manual sales-marketing tasks. Get highly productive through automation and
                        save tons of time!
                    </p>
                </div>
                <p className='text-sm opacity-75'>© 2025 SaleSkip. All rights reserved.</p>
            </div>

            {/* Right Side */}
            <div className='flex-1 flex items-center justify-center bg-white'>
                <div className='w-full max-w-md px-8'>
                    <h2 className='text-2xl font-semibold text-blue-600 mb-2'>SaleSkip</h2>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back!</h1>
                    <p className='text-gray-600 mb-8'>
                        Don't have an account?{' '}
                        <Button
                            onClick={() => navigate('/register')}
                            className='text-blue-600 hover:underline bg-none border-none cursor-pointer'
                        >
                            Create a new account now
                        </Button>
                        , it's FREE! Takes less than a minute.
                    </p>

                    <form onSubmit={form.onSubmit(handleSubmit)} className='space-y-4'>
                        <div>
                            <input
                                type='email'
                                placeholder='Email'
                                key={form.key('email')}
                                {...form.getInputProps('email')}
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition'
                                required
                            />
                        </div>
                        <div>
                            <input
                                type='password'
                                placeholder='Password'
                                key={form.key('password')}
                                {...form.getInputProps('password')}
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition'
                            />
                        </div>

                        <Button
                            type='submit'
                            className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium'
                        >
                            Login Now
                        </Button>

                        <Button
                            type='button'
                            className='w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2 cursor-pointer'
                        >
                            <img src='/google-icon.png' alt='Google' className='w-5 h-5' />
                            Login with Google
                        </Button>

                        <p className='text-center text-gray-600'>
                            Forgot password{' '}
                            <Button
                                onClick={() => navigate('/forgot-password')}
                                className='text-blue-600 hover:underline bg-none border-none cursor-pointer'
                            >
                                Click here
                            </Button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
