import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useState, useEffect, useContext, createContext } from 'react'
import { auth, db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}


export function AuthProvider(props) {
    const { children } = props

    const [globalUser, setGlobalUser] = useState(null)
    const [globalData, setGlobalData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)


    function signUp(email, password) {
        console.log('Signing up with email:', email)
        return createUserWithEmailAndPassword(auth, email, password)
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email)
    }


    function logout() {
        setGlobalUser(null)
        setGlobalData(null)
        return signOut(auth)
    }

    const value = { globalUser, globalData, setGlobalData, isLoading, setIsLoading, signUp, login, resetPassword, logout }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {

            console.log('current user: ', user)
            setGlobalUser(user)

            if (!user) return

            try {
                setIsLoading(true)

                const docRef = doc(db, 'users', user.uid)
                const docSnap = await getDoc(docRef)

                let firebaseData = {}
                if (docSnap.exists()) {
                    console.log('Found user data!')
                    firebaseData = docSnap.data()
                    console.log(firebaseData)
                } else {
                    console.log('No such document!')
                }

                setGlobalData(firebaseData)


            } catch (err) {
                console.error('Error fetching user data:', err.message)
            } finally {
                setIsLoading(false)
            }
        })
        return unsubscribe
    }, [])

    return (
        <>
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        </>
    )
}