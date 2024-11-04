import React, { useState } from 'react';
import { BsFillMicMuteFill } from "react-icons/bs";
import { FaMicrophoneSlash, FaRocketchat, FaSlideshare, FaUserFriends } from 'react-icons/fa';
import ParticipantsSidebar from './ParticipantsSidebar.jsx';

const LiveStreamWindow = ({ studyId }) => {
   // Dummy data for participants
   const participants = [
       { id: 1, name: 'User 1', stream: 'https://via.placeholder.com/150?text=User+1' },
       { id: 2, name: 'User 2', stream: 'https://via.placeholder.com/150?text=User+2' },
       { id: 3, name: 'User 3', stream: 'https://via.placeholder.com/150?text=User+3' },
       { id: 4, name: 'User 4', stream: 'https://via.placeholder.com/150?text=User+4' },
       { id: 5, name: 'User 5', stream: 'https://via.placeholder.com/150?text=User+5' },
       { id: 6, name: 'User 6', stream: 'https://via.placeholder.com/150?text=User+6' },
       { id: 7, name: 'User 7', stream: 'https://via.placeholder.com/150?text=User+7' },
       // Add more participants as needed
   ];

   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="bg-gray-900 text-white flex flex-col h-screen">
            <header className="bg-gray-800 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Live Stream - Study {studyId}</h1>
                <button className="bg-red-500 px-3 py-1 rounded">End Stream</button>
            </header>
            <main className="flex flex-1 flex-col relative m-4">
               {/* Main Stream Area */}
                <div className="flex-1 bg-black flex justify-center items-center" style={{ height: '20%' }}>
                    <p className="text-gray-400">[Video Stream Placeholder]</p>
                    {/* Mute Icon for Shared Screen */}
                    <div className="absolute bottom-2 right-2 bg-gray-600 p-1 rounded-full">
                        <FaMicrophoneSlash size={20} className="text-white" />
                    </div>
                </div>
                <div className="absolute top-4 right-4">
                    {/* Emoticon Button to toggle the sidebar */}
                    <button
                        onClick={toggleSidebar}
                        className="text-white bg-gray-700 p-2 rounded-full hover:bg-gray-600 focus:outline-none"
                    >
                        <FaUserFriends size={24} />
                    </button>
                </div>
                {/* Participant Thumbnails at the bottom with scroll */}
                <div className="bg-gray-800 p-4 flex space-x-2 overflow-x-auto max-h-[80%]">
                    {participants.map((participant) => (
                        <div key={participant.id} className="bg-gray-700 p-2 rounded flex-shrink-0 w-1/4">
                            <img
                                src={participant.stream}
                                alt={participant.name}
                                className="w-full h-32 object-cover rounded"
                            />
                            {/* Mute Icon for Participants */}
                            <div className="absolute bottom-2 right-2 bg-gray-600 p-1 rounded-full">
                                <FaMicrophoneSlash size={20} className="text-white" />
                            </div>
                            <p className="text-sm text-center text-gray-400 mt-2">{participant.name}</p>
                        </div>
                    ))}
                </div>
            </main>
            <footer className="bg-gray-800 p-4 flex justify-center items-center space-x-8">
               <button className="text-white flex items-center">
                  <BsFillMicMuteFill size={24} />
               </button>
               <button className="text-white flex items-center">
                  <FaSlideshare size={24} />
               </button>
               <button className="text-white flex items-center">
                  <FaRocketchat size={24} />
               </button>
         </footer>

            {/* Include the Sidebar */}
            <ParticipantsSidebar participants={participants} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>
    );
};

export default LiveStreamWindow;
