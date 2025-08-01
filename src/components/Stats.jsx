import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { calculateCoffeeStats, calculateCurrentCaffeineLevel, coffeeConsumptionHistory, getTopThreeCoffees, statusLevels } from "../utils"
import Modal from "./Modal"
import { deleteField, doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase"


function StatCard(props) {
    const { lg, title, children } = props
    return (
        <div className={'card stat-card  ' + (lg ? ' col-span-2' : '')}>
            <h4>{title}</h4>
            {children}
        </div>
    )
}

export default function Stats() {

    const [showModal, setShowModal] = useState(false)
    const [coffeeToDelete, setCoffeeToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(null)

    const { globalData, setGlobalData, globalUser } = useAuth()
    const stats = calculateCoffeeStats(globalData)
    console.log(stats)

    function handleCloseModal() {
        setIsDeleting(false)
        setShowModal(false)
        setCoffeeToDelete(null)
    }

    async function handleDeleteCoffee(timestamp) {
        console.log('Deleting coffee with timestamp:', timestamp)
        if (!timestamp || isDeleting) {
            return
        }

        try {
            setIsDeleting(true)
            const newGlobalData = { ...(globalData || {}) }
            delete newGlobalData[timestamp]
            setGlobalData(newGlobalData)

            const userRef = doc(db, 'users', globalUser.uid)

            const res = await updateDoc(userRef, {
                [timestamp]: deleteField()
            })

            handleCloseModal()
        } catch (err) {
            console.error(err.message)
        }

    }

    const caffeineLevel = calculateCurrentCaffeineLevel(globalData)
    const warningLevel = caffeineLevel < statusLevels['low'].maxLevel ?
        'low' :
        caffeineLevel < statusLevels['moderate'].maxLevel ?
            'moderate' :
            'high'

    return (
        <>
            {showModal && (
                <Modal handleCloseModal={handleCloseModal}>
                    <div className="delete-modal">
                        <h2 className="sign-up-text" >Do you want to delete this coffee?</h2>
                        <div className="button-wrapper coffee-grid">
                            <button onClick={() => {
                                handleDeleteCoffee(coffeeToDelete)
                                // handleCloseModal()
                            }} style={{ color: "#f35353" }}>{!isDeleting ? 'Yes' : 'Deleting...'}</button>
                            <button onClick={handleCloseModal}>No</button>
                        </div>
                    </div>
                </Modal>
            )}
            <div className="section-header">
                <i className="fa-solid fa-chart-simple" />
                <h2>Stats</h2>
            </div>
            <div className="stats-grid">
                <StatCard lg title="Active Caffeine Level">
                    <div className="status">
                        <p><span className="stat-text">{caffeineLevel}</span>mg</p>
                        <h5 style={{ color: statusLevels[warningLevel].color, background: statusLevels[warningLevel].background }}>{warningLevel}</h5>
                    </div>
                    <p>{statusLevels[warningLevel].description}</p>
                </StatCard>
                <StatCard title="Daily Caffeine">
                    <p><span className="stat-text">{stats.daily_caffeine}</span>mg</p>
                </StatCard>
                <StatCard title="Avg # of Coffees">
                    <p><span className="stat-text">{stats.average_coffees}</span></p>
                </StatCard>
                <StatCard title="Daily Cost ($)">
                    <p>$ <span className="stat-text">{stats.daily_cost}</span></p>
                </StatCard>
                <StatCard title="Total Cost ($)">
                    <p>$ <span className="stat-text">{stats.total_cost}</span></p>
                </StatCard>
                <table className="stat-table">
                    <thead>
                        <tr>
                            <th>Coffee Name</th>
                            <th>Number of Purchase</th>
                            <th>Percentage of Total</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getTopThreeCoffees(globalData).map((coffee, coffeeIndex) => {
                            // console.log("coffee", Object.keys(globalData)[coffeeIndex])
                            return (
                                <tr key={coffeeIndex}>
                                    <td>{coffee.coffeeName}</td>
                                    <td>{coffee.count}</td>
                                    <td>{coffee.percentage}</td>
                                    <td><button onClick={() => {
                                        setShowModal(true)
                                        setCoffeeToDelete(Object.keys(globalData)[coffeeIndex])
                                    }}><i className="fa-solid fa-trash" style={{ color: "#f35353" }}></i></button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}