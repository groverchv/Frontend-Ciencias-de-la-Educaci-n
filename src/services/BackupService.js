import api from "../api/api";

const API_URL = "/api/backup";

class BackupService {
    /**
     * Descargar backup manual
     */
    async downloadBackup() {
        try {
            const response = await api.get(`${API_URL}/download`, {
                responseType: 'blob',
                timeout: 300000 // 5 minutos timeout para backups grandes
            });

            // Verificar que la respuesta tiene contenido
            if (!response.data || response.data.size === 0) {
                throw new Error('El backup descargado está vacío');
            }

            // Crear un enlace temporal para descargar el archivo
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Obtener el nombre del archivo del header
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'backup.sql';
            
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (fileNameMatch && fileNameMatch.length === 2) {
                    fileName = fileNameMatch[1].replace(/"/g, '');
                }
            }
            
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            // Limpiar URL temporal después de un delay
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 100);
            
            return { success: true, fileName, size: response.data.size };
        } catch (error) {
            console.error("Error al descargar backup:", error);
            
            // Manejar diferentes tipos de errores
            if (error.response) {
                // El servidor respondió con un código de error
                if (error.response.status === 403 || error.response.status === 401) {
                    throw new Error('No tienes permisos para descargar backups');
                } else if (error.response.status === 500) {
                    const errorData = error.response.data;
                    if (errorData && errorData.error) {
                        throw new Error(errorData.error);
                    }
                    throw new Error('Error del servidor al crear el backup');
                }
            } else if (error.request) {
                // La petición se hizo pero no hubo respuesta
                throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
            }
            
            throw error;
        }
    }

    /**
     * Restaurar base de datos desde un archivo
     */
    async restoreBackup(file) {
        try {
            // Validaciones del lado del cliente
            if (!file) {
                throw new Error('No se proporcionó ningún archivo');
            }

            if (!file.name.toLowerCase().endsWith('.sql')) {
                throw new Error('El archivo debe tener extensión .sql');
            }

            // Validar tamaño (máximo 500MB)
            const maxSize = 500 * 1024 * 1024;
            if (file.size > maxSize) {
                throw new Error('El archivo es demasiado grande. Tamaño máximo: 500MB');
            }

            if (file.size === 0) {
                throw new Error('El archivo está vacío');
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(`${API_URL}/restore`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 600000 // 10 minutos timeout para restauraciones grandes
            });

            return response.data;
        } catch (error) {
            console.error("Error al restaurar backup:", error);
            
            // Manejar diferentes tipos de errores
            if (error.response) {
                if (error.response.status === 403 || error.response.status === 401) {
                    throw new Error('No tienes permisos para restaurar backups');
                } else if (error.response.status === 400) {
                    const errorData = error.response.data;
                    throw new Error(errorData.error || 'Datos de restauración inválidos');
                } else if (error.response.status === 500) {
                    const errorData = error.response.data;
                    throw new Error(errorData.error || 'Error del servidor al restaurar');
                }
            } else if (error.request) {
                throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
            }
            
            throw error;
        }
    }

    /**
     * Obtener estado del servicio de backup
     */
    async getBackupStatus() {
        try {
            const response = await api.get(`${API_URL}/status`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener estado del backup:", error);
            
            if (error.response?.status === 403 || error.response?.status === 401) {
                throw new Error('No tienes permisos para ver el estado del backup');
            }
            
            throw error;
        }
    }

    /**
     * Listar todos los backups disponibles
     */
    async listBackups() {
        try {
            const response = await api.get(`${API_URL}/list`);
            // Asegurar que siempre se devuelva un array
            const data = response.data;
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Error al listar backups:", error);
            
            if (error.response?.status === 403 || error.response?.status === 401) {
                throw new Error('No tienes permisos para listar backups');
            } else if (error.response?.status === 500) {
                throw new Error('Error del servidor al listar backups');
            }
            
            throw error;
        }
    }

    /**
     * Descargar un backup específico por nombre
     */
    async downloadSpecificBackup(fileName) {
        try {
            if (!fileName) {
                throw new Error('Debe proporcionar el nombre del archivo');
            }

            const response = await api.get(`${API_URL}/download/${encodeURIComponent(fileName)}`, {
                responseType: 'blob',
                timeout: 300000 // 5 minutos timeout
            });

            // Verificar que la respuesta tiene contenido
            if (!response.data || response.data.size === 0) {
                throw new Error('El backup descargado está vacío');
            }

            // Crear un enlace temporal para descargar el archivo
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            // Limpiar URL temporal
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 100);
            
            return { success: true, fileName, size: response.data.size };
        } catch (error) {
            console.error("Error al descargar backup específico:", error);
            
            if (error.response) {
                if (error.response.status === 403 || error.response.status === 401) {
                    throw new Error('No tienes permisos para descargar este backup');
                } else if (error.response.status === 404) {
                    throw new Error('Backup no encontrado');
                } else if (error.response.status === 400) {
                    throw new Error('Nombre de archivo inválido');
                } else if (error.response.status === 500) {
                    throw new Error('Error del servidor al descargar el backup');
                }
            } else if (error.request) {
                throw new Error('No se pudo conectar con el servidor');
            }
            
            throw error;
        }
    }

    /**
     * Eliminar un backup específico
     */
    async deleteBackup(fileName) {
        try {
            if (!fileName) {
                throw new Error('Debe proporcionar el nombre del archivo');
            }

            const response = await api.delete(`${API_URL}/${encodeURIComponent(fileName)}`);
            return response.data;
        } catch (error) {
            console.error("Error al eliminar backup:", error);
            
            if (error.response) {
                if (error.response.status === 403 || error.response.status === 401) {
                    throw new Error('No tienes permisos para eliminar backups');
                } else if (error.response.status === 404) {
                    throw new Error('Backup no encontrado');
                } else if (error.response.status === 400) {
                    throw new Error('Nombre de archivo inválido');
                } else if (error.response.status === 500) {
                    throw new Error('Error del servidor al eliminar el backup');
                }
            } else if (error.request) {
                throw new Error('No se pudo conectar con el servidor');
            }
            
            throw error;
        }
    }
}

export default new BackupService();
