// Utilidad para registrar Service Worker y manejar notificaciones
class NotificationService {
    constructor() {
        this.registration = null;
    }

    async init() {
        // Verificar si el navegador soporta Service Workers y Notificaciones
        if (!('serviceWorker' in navigator)) {
            return false;
        }

        if (!('Notification' in window)) {
            return false;
        }

        try {
            // Registrar Service Worker
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            // Solicitar permiso para notificaciones
            await this.requestNotificationPermission();

            return true;
        } catch (error) {
            console.error('Error al registrar Service Worker:', error);
            return false;
        }
    }

    async requestNotificationPermission() {
        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                // Mostrar notificación de prueba
                this.showTestNotification();
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error al solicitar permisos de notificación:', error);
            return false;
        }
    }

    showTestNotification() {
        if (!this.registration) return;

        this.registration.showNotification('🔔 Notificaciones Activadas', {
            body: 'Ahora recibirás notificaciones cuando se publique nuevo contenido',
            icon: '/logo.svg',
            badge: '/logo.svg',
            vibrate: [200, 100, 200],
            tag: 'test-notification',
            requireInteraction: false
        });
    }

    async showContentNotification(data) {
        const { titulo, subMenuTitulo, ruta, contenidoId } = data;

        // Reproducir sonido PRIMERO
        this.playNotificationSound();

        // Vibrar el dispositivo
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }

        // Verificar permisos
        if (Notification.permission !== 'granted') {
            alert(`📢 Nuevo contenido publicado:\n\n"${titulo}" en ${subMenuTitulo}\n\n¿Deseas verlo ahora?`);
            return;
        }

        if (!this.registration) {
            // Fallback: Notificación del navegador sin Service Worker
            const notification = new Notification('📢 Nuevo Contenido Publicado', {
                body: `${titulo} en ${subMenuTitulo}`,
                icon: '/logo.svg',
                badge: '/logo.svg',
                    tag: `contenido-${contenidoId}`,
                    requireInteraction: true,
                    vibrate: [200, 100, 200, 100, 200]
                });

                notification.onclick = () => {
                    window.location.href = ruta;
                    notification.close();
                };
            
            return;
        }

        // Enviar mensaje al Service Worker para mostrar notificación
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                payload: { titulo, subMenuTitulo, ruta, contenidoId }
            });
        } else {
            // Alternativa: Mostrar notificación directamente
            await this.registration.showNotification('📢 Nuevo Contenido Publicado', {
                body: `${titulo} en ${subMenuTitulo}`,
                icon: '/logo.svg',
                badge: '/logo.svg',
                tag: `contenido-${contenidoId}`,
                requireInteraction: true,
                vibrate: [200, 100, 200, 100, 200],
                data: { url: ruta },
                actions: [
                    { action: 'view', title: 'Ver ahora' },
                    { action: 'close', title: 'Cerrar' }
                ]
            });
        }
    }

    playNotificationSound() {
        try {
            // Usar el archivo alert.mp3
            const audio = new Audio('/alert.mp3');
            audio.volume = 0.7; // Volumen más alto (70%)
            
            // Intentar reproducir
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .catch(() => {
                        // Fallback: intentar con beep simple
                        this.playFallbackSound();
                    });
            }
        } catch (error) {
            this.playFallbackSound();
        }
    }

    playFallbackSound() {
        try {
            // Beep simple como fallback
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            setTimeout(() => oscillator.stop(), 200);
        } catch (error) {
            // Silenciosamente fallar si no se puede reproducir
        }
    }

    getPermissionStatus() {
        if (!('Notification' in window)) {
            return 'not-supported';
        }
        return Notification.permission;
    }

    async checkPermission() {
        const permission = this.getPermissionStatus();
        
        if (permission === 'granted') {
            return true;
        }
        
        if (permission === 'denied') {
            alert('⚠️ Las notificaciones están bloqueadas.\n\nPara activarlas:\n1. Haz clic en el icono de candado/información en la barra de direcciones\n2. Busca "Notificaciones"\n3. Cambia a "Permitir"');
            return false;
        }
        
        // Si está en 'default', solicitar permiso
        return await this.requestNotificationPermission();
    }
}

export default new NotificationService();
