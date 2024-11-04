// src/components/JoinPage.jsx
import React from 'react';
import JoinForm from '../../components/form/JoinForm.jsx';

const JoinPage = () => {
  return (
    <div className="flex w-full h-screen">
      {/* Background Section */}
      <div className="relative hidden lg:flex h-full w-1/2 items-center justify-center bg-gray-200">
        <div className='w-60 h-60 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full animate-bounce'/>
        <div className="w-full h-1/2 absolute bottom-0 bg-white/10 backdrop-blur-lg"/>
      </div>

      {/* Form Section */}
      <div className='w-full lg:w-1/2 flex items-center justify-center bg-gray-100'>
        <JoinForm />
      </div>
    </div>
  );
};

export default JoinPage;
