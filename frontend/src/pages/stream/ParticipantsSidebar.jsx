import React from 'react';

const ParticipantsSidebar = ({ participants, isOpen, toggleSidebar }) => {
    return (
        <div
            className={`fixed right-0 top-0 h-full bg-gray-800 text-white shadow-lg transform ${
                isOpen ? 'translate-x-0' : 'translate-x-full'
            } transition-transform duration-300 w-64`}
        >
            <header className="bg-gray-900 p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Participants</h2>
                <button onClick={toggleSidebar} className="text-gray-400 hover:text-white">
                    Close
                </button>
            </header>
            <ul className="p-4 space-y-2">
                {participants.map(participant => (
                    <li key={participant.id} className="bg-gray-700 p-2 rounded">
                        {participant.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ParticipantsSidebar;