import React from 'react';
import SignUp from '../sign-up/SignUp';

const RegisterForm = ({ redirectTo }) => {
  return (
    <div className="mt-10">
      <SignUp redirectTo={redirectTo} />
    </div>
  );
};

export default RegisterForm;