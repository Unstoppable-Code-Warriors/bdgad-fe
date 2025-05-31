import { useNavigate } from 'react-router'
import { Button, Checkbox, TextInput, PasswordInput } from '@mantine/core'
import { useForm } from '@mantine/form'

const Login = () => {
    const navigate = useNavigate()
    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            rememberMe: false
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            password: (value) => (value.length < 6 ? 'Password should be at least 6 characters' : null)
        }
    })

    const handleSubmit = (_values: typeof form.values) => {
        navigate('/dashboard')
    }

    return (
        <div className='flex h-screen bg-gray-50'>
            {/* Left Side - Illustration */}
            <div className='flex-1 flex items-center justify-center p-12'>
                <div className='max-w-lg'>
                    <img 
                        src='/medical-illustration.svg' 
                        alt='Medical professionals with technology'
                        className='w-full h-auto'
                    />
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className='flex-1 flex items-center justify-center bg-white'>
                <div className='w-full max-w-md px-8'>
                    <div className='mb-8'>
                        <h1 className='text-2xl font-bold text-gray-900 mb-2'>Login Doccure</h1>
                    </div>

                    <form onSubmit={form.onSubmit(handleSubmit)} className='space-y-6'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                E-mail
                            </label>
                            <TextInput
                                placeholder='Enter your email'
                                key={form.key('email')}
                                {...form.getInputProps('email')}
                                className='w-full'
                                styles={{
                                    input: {
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '12px 16px',
                                        fontSize: '14px'
                                    }
                                }}
                            />
                        </div>

                        <div>
                            <div className='flex justify-between items-center mb-2'>
                                <label className='block text-sm font-medium text-gray-700'>
                                    Password
                                </label>
                                <Button
                                    variant='subtle'
                                    size='xs'
                                    onClick={() => navigate('/forgot-password')}
                                    className='text-blue-600 hover:text-blue-700 p-0'
                                >
                                    Forgot password?
                                </Button>
                            </div>
                            <PasswordInput
                                placeholder='Enter your password'
                                key={form.key('password')}
                                {...form.getInputProps('password')}
                                className='w-full'
                                styles={{
                                    input: {
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '12px 16px',
                                        fontSize: '14px'
                                    }
                                }}
                            />
                        </div>

                        <div className='flex items-center justify-between'>
                            <Checkbox
                                key={form.key('rememberMe')}
                                {...form.getInputProps('rememberMe', { type: 'checkbox' })}
                                label='Remember Me'
                                className='text-sm text-gray-600'
                            />
                            {/* <Button
                                variant='subtle'
                                size='sm'
                                className='text-blue-600 hover:text-blue-700'
                            >
                                Login with OTP
                            </Button> */}
                        </div>

                        <Button
                            type='submit'
                            className='w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition font-medium text-base border-rounded-lg'
                            size='lg'
                            fullWidth
                            styles={{
                                root: {
                                    height: '48px',
                                    fontSize: '16px'
                                }
                            }}
                        >
                            Sign in
                        </Button>

                        {/* <div className='text-center'>
                            <span className='text-gray-500 text-sm'>or</span>
                        </div>

                        <div className='space-y-3'>
                            <Button
                                variant='outline'
                                className='w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-3'
                                size='lg'
                            >
                                <img src='/google-icon.png' alt='Google' className='w-5 h-5' />
                                Sign in With Google
                            </Button>

                            <Button
                                variant='outline'
                                className='w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-3'
                                size='lg'
                            >
                                <img src='/facebook-icon.png' alt='Facebook' className='w-5 h-5' />
                                Sign in With Facebook
                            </Button>
                        </div>

                        <p className='text-center text-gray-600 text-sm'>
                            Don't have an account?{' '}
                            <Button
                                variant='subtle'
                                onClick={() => navigate('/register')}
                                className='text-blue-600 hover:text-blue-700 p-0 font-medium'
                            >
                                Sign up
                            </Button>
                        </p> */}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
