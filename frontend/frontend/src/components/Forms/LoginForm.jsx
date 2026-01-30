import React from 'react';
import SignInSide from '../sign-in-side/SignInSide';

const LoginForm = ({ redirectTo }) => {
  return (
    <section className="max-h-screen">
      <SignInSide redirectTo={redirectTo} />
    </section>
  );
};

export default LoginForm;