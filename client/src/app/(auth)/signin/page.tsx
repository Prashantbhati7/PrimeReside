"use client"
import LoginForm from '@/components/LoginForm'
import React from 'react'
import { useAuth } from '@/app/(auth)/authProvider'

const SignInPage = () => {
  const { login } = useAuth();
  
  return (
    <div className="flex h-full w-full items-center justify-center p-4 pt-10">
        <LoginForm onLogin={login}/>
    </div>
  )
}

export default SignInPage
