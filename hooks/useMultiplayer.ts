import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { CardData, Player, Profile, PowerUpType } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export interface RoomData {
  id: string;
  hostId: string;
  players: (Player & { socketId: string, isReady: boolean })[];
  settings: {
    maxPlayers: number;
    boardSize: number;
    theme: string;
  };
  status: 'LOBBY' | 'PLAYING' | 'GAME_OVER';
  board?: CardData[];
  activePlayerId?: number;
}

export const useMultiplayer = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setRoom(null);
    });

    // Room update events
    newSocket.on('roomUpdated', (updatedRoom: RoomData) => {
      setRoom(updatedRoom);
    });

    newSocket.on('gameStarted', (updatedRoom: RoomData) => {
      setRoom(updatedRoom);
    });

    newSocket.on('powerUpUsed', ({ powerUpType, playerId }) => {
      // We'll let App.tsx handle the actual logic if needed, 
      // but for now we can just emit an event or rely on setRoom if server updated it.
      // Actually, server didn't update room state in my previous edit, just broadcasted.
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const createRoom = useCallback((profile: Profile, boardSize: number, theme: string) => {
    if (!socket) return;
    setError(null);
    socket.emit('createRoom', { profile, maxPlayers: 2, boardSize, theme }, (response: any) => {
      if (response.success) {
        setRoom(response.roomData);
      } else {
        setError(response.message);
      }
    });
  }, [socket]);

  const joinRoom = useCallback((roomId: string, profile: Profile) => {
    if (!socket) return;
    setError(null);
    socket.emit('joinRoom', { roomId, profile }, (response: any) => {
      if (response.success) {
        setRoom(response.roomData);
      } else {
        setError(response.message);
      }
    });
  }, [socket]);

  const leaveRoom = useCallback(() => {
    if (socket && room) {
      socket.emit('leaveRoom', room.id);
      setRoom(null);
    }
  }, [socket, room]);

  const startGameOnline = useCallback(() => {
      if(socket && room && room.hostId === socket.id) {
          const seed = Math.floor(Math.random() * 1000000);
          socket.emit('startGame', { roomId: room.id, seed });
      }
  }, [socket, room]);

  const sendInput = useCallback((type: string, data?: any) => {
    if (socket && room) {
        socket.emit('playerInput', { 
            roomId: room.id, 
            type, 
            data 
        });
    }
  }, [socket, room]);

  return {
    socket,
    isConnected,
    room,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    startGameOnline,
    sendInput
  };
};
