import React, { useState } from 'react';

export const User = React.createContext({username: '', setUsername: () => {}});

function UserContext({ children }) {
    let [username, setUsername] = useState('');
    const value = { username, setUsername };

    return (
        <User.Provider value={value}>
            { children }
        </User.Provider>
    );
}

export default UserContext;