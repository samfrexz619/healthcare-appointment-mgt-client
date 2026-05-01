import LoginForm from "@/components/forms/LoginForm";



const LoginPage = () => {


  return (
    <section className='w-full px-8 sm:px-3 sm:w-[400px] mx-auto h-[500px]'>

      <h6 className='text-center text-xl font-bold'>Sign In</h6>
      <LoginForm />
    </section>

  );
}

export default LoginPage;
