import { User } from "types/auth"

export default function UserPopup(props: User) {
    return (
        <div 
            className="border rounded p-4 border-gray-700" 
            style={{ backgroundColor: "#f8f8f8" }}
        >   
            {/* First and last name in a slightly more uniform style */}
            <div className="text-xl font-semibold mb-1">
            {props.firstname} {props.lastname}
            </div>
            
            {/* Other information styled uniformly */}
            <div className="text-base text-gray-600">
            <p>Email: {props.email}</p>
            <p>Role: {props.role}</p>
            <p>Requested: {props.roleRequested || 'none'}</p>
            </div>
        </div>
    )
}