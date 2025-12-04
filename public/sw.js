// Service Worker para notificaciones push
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activado');
    event.waitUntil(clients.claim());
});

// Escuchar mensajes desde la aplicación principal
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { titulo, subMenuTitulo, ruta, contenidoId } = event.data.payload;
        
        self.registration.showNotification('📢 Nuevo Contenido Publicado', {
            body: `${titulo} en ${subMenuTitulo}`,
            icon: '/logo.svg',
            badge: '/logo.svg',
            tag: `contenido-${contenidoId}`,
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200],
            data: {
                url: ruta
            },
            actions: [
                {
                    action: 'view',
                    title: 'Ver ahora'
                },
                {
                    action: 'close',
                    title: 'Cerrar'
                }
            ]
        });
    }
});

// Manejar clics en la notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        // Abrir o enfocar la ventana con la URL del contenido
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    const url = event.notification.data.url;
                    
                    // Buscar si ya hay una ventana abierta con el origen
                    for (let client of clientList) {
                        if (client.url.includes(self.location.origin) && 'focus' in client) {
                            return client.focus().then(() => {
                                // Navegar a la nueva URL
                                return client.navigate(url);
                            });
                        }
                    }
                    
                    // Si no hay ventana abierta, abrir una nueva
                    if (clients.openWindow) {
                        return clients.openWindow(url);
                    }
                })
        );
    }
});

// Manejar push notifications (para futuro uso con servidor push)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'Nuevo contenido disponible',
            icon: '/logo.svg',
            badge: '/logo.svg',
            vibrate: [200, 100, 200, 100, 200],
            data: data.data || {},
            requireInteraction: true
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Notificación', options)
        );
    }
});
