import React, { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import LoginForm from '../components/Forms/LoginForm.jsx'
import RegisterForm from '../components/Forms/RegisterForm.jsx';
import { FloatingShapes } from '../components/utils/floating-shapers.jsx';
import Navbar from '../components/utils/Navbar.jsx';

const AuthPage = () => {
  const search = useSearch({ from: '/auth' });
  const [login, setLogin] = useState(search?.mode !== 'signup');

  
  useEffect(() => {
    setLogin(search?.mode !== 'signup');
  }, [search]);

  return (
    <>
      <FloatingShapes />
     <Navbar />
      {login ? <LoginForm state={setLogin} redirectTo={search?.redirect} /> : <RegisterForm state={setLogin} redirectTo={search?.redirect} />}
    </>
  )
}

export default AuthPage
