import { Link, Outlet } from "react-router-dom";

export default function TopNavLayout() {
    return (
        <>
            <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#f4f4f4' }}>
                <Link to="/">Home</Link>
                <Link to="/find-room">Find a Room</Link>
                <Link to="/campus-map">Campus Map</Link>
                <Link to="/favorites">Favorites</Link>
            <   Link to="/preferences">Preferences</Link>
            </nav>
        
            <Outlet />
        </>
    );
}