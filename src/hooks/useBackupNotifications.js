import { useEffect } from 'react';
import { notification } from 'antd';
import WebSocketService from '../services/WebSocketService';

/**
 * Hook para escuchar notificaciones de backup vía WebSocket
 */
export const useBackupNotifications = () => {
    useEffect(() => {
        // Verificar silenciosamente si WebSocket está conectado
        if (!WebSocketService.isConnected()) {
            // No mostrar warning, solo retornar silenciosamente
            return;
        }

        // Suscribirse a notificaciones de backup
        const subscription = WebSocketService.subscribe('/topic/backup-notification', (message) => {
            console.log('Notificación de backup recibida:', message);
            
            // Determinar si es éxito o error
            const isSuccess = typeof message === 'string' && 
                (message.toLowerCase().includes('exitosamente') || 
                 message.toLowerCase().includes('completado'));
            
            const isError = typeof message === 'string' && 
                message.toLowerCase().includes('error');

            // Mostrar notificación apropiada
            if (isSuccess) {
                notification.success({
                    message: 'Backup Completado',
                    description: message,
                    duration: 5,
                    placement: 'topRight',
                });
            } else if (isError) {
                notification.error({
                    message: 'Error en Backup',
                    description: message,
                    duration: 8,
                    placement: 'topRight',
                });
            } else {
                notification.info({
                    message: 'Notificación de Backup',
                    description: message,
                    duration: 5,
                    placement: 'topRight',
                });
            }
        });

        return () => {
            if (subscription) {
                WebSocketService.unsubscribe('/topic/backup-notification');
            }
        };
    }, []);
};

export default useBackupNotifications;
