"use client"
import SignupForm from '@/components/SignupForm'
import React from 'react'
import { useAuth } from '@/app/(auth)/authProvider'

const SignUpPage = () => {
  const { signup } = useAuth();

  return (
    <div className="flex h-full w-full items-center justify-center p-4 pt-10">
        <SignupForm onSignup={signup}/>
    </div>
  )
}

export default SignUpPage
