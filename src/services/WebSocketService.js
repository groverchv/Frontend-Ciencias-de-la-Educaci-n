import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscribers = new Map();
    }

    connect(username, location, onConnected, onError) {
        const socket = new SockJS('http://localhost:8080/ws');
        
        this.client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                username: username,
                location: location || 'other'
            },
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            this.connected = true;
            console.log('WebSocket conectado:', frame);
            
            // Registrar usuario con ubicación
            this.client.publish({
                destination: '/app/user.register',
                body: JSON.stringify({
                    username: username,
                    location: location || 'other'
                })
            });

            // Ejecutar callback después de registrar usuario
            if (onConnected) {
                // Esperar un poco para asegurar que el registro se procese
                setTimeout(() => {
                    onConnected(frame);
                }, 100);
            }
        };

        this.client.onStompError = (frame) => {
            console.error('Error STOMP:', frame);
            this.connected = false;
            if (onError) {
                onError(frame);
            }
        };

        this.client.onWebSocketError = (error) => {
            console.error('Error WebSocket:', error);
            if (onError) {
                onError(error);
            }
        };

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.connected = false;
            this.subscribers.clear();
            console.log('WebSocket desconectado');
        }
    }

    subscribe(topic, callback) {
        if (!this.client || !this.connected) {
            console.warn('WebSocket no está conectado para suscripción a:', topic);
            return null;
        }

        const subscription = this.client.subscribe(topic, (message) => {
            try {
                // Intentar parsear como JSON
                const body = JSON.parse(message.body);
                callback(body);
            } catch {
                // Si no es JSON, verificar si es un número
                const numValue = Number(message.body);
                if (!isNaN(numValue)) {
                    callback(numValue);
                } else {
                    // Devolver como string
                    callback(message.body);
                }
            }
        });

        this.subscribers.set(topic, subscription);
        console.log('Suscrito a:', topic);
        return subscription;
    }

    unsubscribe(topic) {
        const subscription = this.subscribers.get(topic);
        if (subscription) {
            subscription.unsubscribe();
            this.subscribers.delete(topic);
        }
    }

    send(destination, body) {
        if (!this.client || !this.connected) {
            console.warn('WebSocket no está conectado');
            return;
        }

        this.client.publish({
            destination: destination,
            body: typeof body === 'string' ? body : JSON.stringify(body)
        });
    }

    updateLocation(location) {
        if (!this.client || !this.connected) {
            console.warn('WebSocket no está conectado para actualizar ubicación');
            return;
        }

        this.client.publish({
            destination: '/app/user.location',
            body: JSON.stringify({ location: location })
        });
        
        console.log('Ubicación actualizada a:', location);
    }

    isConnected() {
        return this.connected;
    }
}

export default new WebSocketService();
