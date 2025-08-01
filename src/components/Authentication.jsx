import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Authentication(props) {

    const { handleCloseModal } = props;

    const [isRegistration, setIsRegistration] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [error, setError] = useState(null);

    const { signUp, login } = useAuth()

    async function handleAuthentication() {
        setIsAuthenticating(true);
        console.log('Handling authentication for:', email)
        if (!email || !email.includes('@') || !password || password.length < 8) {
            console.log('Invalid email or password')
            setError('Please enter a valid email and password (minimum 8 characters).');
            setIsAuthenticating(false)
            return;
        }

        if (isAuthenticating) {
            console.log('Already authenticating, please wait...');
            return;
        }

        try {
            setIsAuthenticating(true);
            setError(null)
            if (isRegistration) {
                await signUp(email, password)
            } else {
                await login(email, password)
            }

            handleCloseModal()

        } catch (err) {
            switch (err.message) {
                case 'Firebase: Error (auth/email-already-in-use).':
                    setError('This email is already in use. Please try logging in.');
                    break;
                case 'Firebase: Error (auth/invalid-credential).':
                    setError('Please enter a valid email, password pair.');
                    break;
                case 'Firebase: Error (auth/invalid-email).':
                    setError('Please enter a valid email address.');
                    break;
                default:
                    setError('An error occurred during authentication. Please try again.');
            }

            // setError(err.message)
            console.log('Error during authentication:', err.message);
        } finally {
            setIsAuthenticating(false)
        }
    }

    return (
        <>
            <h2 className="sign-up-text">{isRegistration ? 'Sign Up' : 'Login'}</h2>
            <p>{isRegistration ? 'Create an account!' : 'Sign in to your account!'}</p>
            {error && (
                <p className="error-message">❌{error}</p>
            )}
            <input type="text" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value) }} />
            <input type="password" placeholder="*********" value={password} onChange={(e) => { setPassword(e.target.value) }} />
            <button onClick={handleAuthentication}><p>{isAuthenticating ? 'Authenticating...' : 'Submit'}</p></button>
            <hr />
            <div className="register-content">
                <p>{isRegistration ? 'Already have an account?' : 'Don\'t have an account?'}</p>
                <button onClick={() => {
                    setIsRegistration(!isRegistration);
                }} ><p>{isRegistration ? 'Sign in' : 'Sign up'}</p></button>
            </div>
        </>
    );
}