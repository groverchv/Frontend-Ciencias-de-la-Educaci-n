// src/pages/Dashboard/PaqueteContenido/Contenido/Funcionalidades/useImageConfig.js
import { useState, useCallback, useEffect } from 'react';

export default function useImageConfig(quillRef, contenidoHtml) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

    // Configurar event listeners en imágenes - SE EJECUTA CUANDO CAMBIA EL CONTENIDO
    useEffect(() => {
        console.log('👀 useImageConfig useEffect ejecutado', { contenidoHtmlLength: contenidoHtml?.length });

        // Esperar un momento para que Quill procese el contenido
        const timer = setTimeout(() => {
            console.log('⏰ Timer ejecutado, verificando quillRef...');

            if (!quillRef.current) {
                console.warn('⚠️ quillRef.current es null');
                return;
            }

            const quill = quillRef.current.getEditor();
            if (!quill) {
                console.warn('⚠️ No se pudo obtener el editor de Quill');
                return;
            }

            const editorElement = quill.root;
            console.log('✅ Quill editor encontrado');

            // Configurar imágenes
            const configureImages = () => {
                const images = editorElement.querySelectorAll('img');
                console.log(`🖼️ Configurando ${images.length} imágenes`);

                images.forEach((img, index) => {
                    console.log(`  Imagen ${index + 1}`);

                    // Click simple
                    img.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🖱️ CLICK!');
                        setSelectedImage(img);
                        setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
                    };

                    // Click derecho
                    img.oncontextmenu = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🖱️ RIGHT-CLICK!');
                        setSelectedImage(img);
                        setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
                        return false;
                    };

                    img.style.cursor = 'pointer';
                });
            };

            // Configurar imágenes existentes
            configureImages();

            // Observer para nuevas imágenes
            const observer = new MutationObserver(() => {
                console.log('🔄 DOM cambió');
                configureImages();
            });

            observer.observe(editorElement, { childList: true, subtree: true });

            // Escuchar cambios de Quill
            quill.on('text-change', () => {
                setTimeout(configureImages, 100);
            });

            // Cleanup en el return del timeout
            return () => {
                observer.disconnect();
            };
        }, 300);

        // Cleanup del timer
        return () => clearTimeout(timer);
    }, [contenidoHtml]); // Usar contenidoHtml como dependencia

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = () => {
            if (contextMenu.visible) {
                setContextMenu({ visible: false, x: 0, y: 0 });
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [contextMenu.visible]);

    // Abrir modal desde menú contextual
    const openConfigFromMenu = useCallback(() => {
        setContextMenu({ visible: false, x: 0, y: 0 });
        setModalVisible(true);
    }, []);

    // Alineación rápida
    const applyQuickAlignment = useCallback((alignment) => {
        if (!selectedImage || !quillRef.current) return;

        const quill = quillRef.current.getEditor();

        // Usar CLASES en lugar de data attributes para mejor compatibilidad
        // Primero remover clases de alineación existentes
        selectedImage.classList.remove('align-left', 'align-center', 'align-right');

        // Agregar nueva clase
        if (alignment) {
            selectedImage.classList.add(`align-${alignment}`);
        }

        selectedImage.style.display = 'block';

        if (alignment === 'center') {
            selectedImage.style.marginLeft = 'auto';
            selectedImage.style.marginRight = 'auto';
        } else if (alignment === 'left') {
            selectedImage.style.marginLeft = '0';
            selectedImage.style.marginRight = 'auto';
        } else if (alignment === 'right') {
            selectedImage.style.marginLeft = 'auto';
            selectedImage.style.marginRight = '0';
        }

        // IMPORTANTE: Forzar actualización de Quill para que persista los cambios
        const range = quill.getSelection() || { index: 0, length: 0 };
        quill.updateContents([{ retain: quill.getLength() }], 'user');

        setContextMenu({ visible: false, x: 0, y: 0 });
    }, [selectedImage, quillRef]);

    const alignLeft = useCallback(() => applyQuickAlignment('left'), [applyQuickAlignment]);
    const alignCenter = useCallback(() => applyQuickAlignment('center'), [applyQuickAlignment]);
    const alignRight = useCallback(() => applyQuickAlignment('right'), [applyQuickAlignment]);

    // Aplicar configuración completa
    const applyImageConfig = useCallback((config) => {
        if (!selectedImage || !quillRef.current) return;
        const quill = quillRef.current.getEditor();
        Object.entries(config.styles).forEach(([key, value]) => {
            selectedImage.style[key] = value;
        });
        if (config.alt !== undefined) selectedImage.setAttribute('alt', config.alt);
        if (config.title !== undefined) selectedImage.setAttribute('title', config.title);
        const parentLink = selectedImage.closest('a');
        if (config.linkUrl) {
            if (parentLink) {
                parentLink.setAttribute('href', config.linkUrl);
                parentLink.setAttribute('target', config.linkTarget);
            } else {
                const link = document.createElement('a');
                link.setAttribute('href', config.linkUrl);
                link.setAttribute('target', config.linkTarget);
                const parent = selectedImage.parentElement;
                parent.insertBefore(link, selectedImage);
                link.appendChild(selectedImage);
            }
        } else if (parentLink) {
            const parent = parentLink.parentElement;
            parent.insertBefore(selectedImage, parentLink);
            parent.removeChild(parentLink);
        }

        if (config.alignment) {
            // Remover clases anteriores
            selectedImage.classList.remove('align-left', 'align-center', 'align-right');
            // Agregar nueva clase
            selectedImage.classList.add(`align-${config.alignment}`);

            selectedImage.style.display = 'block';
            if (config.alignment === 'center') {
                selectedImage.style.marginLeft = 'auto';
                selectedImage.style.marginRight = 'auto';
            } else if (config.alignment === 'left') {
                selectedImage.style.marginLeft = '0';
                selectedImage.style.marginRight = 'auto';
            } else if (config.alignment === 'right') {
                selectedImage.style.marginLeft = 'auto';
                selectedImage.style.marginRight = '0';
            }
        }

        if (config.styles.float && config.styles.float !== 'none') {
            selectedImage.style.display = 'inline-block';
            selectedImage.style.verticalAlign = 'top';
            // Remover alineación si hay float
            selectedImage.classList.remove('align-left', 'align-center', 'align-right');

            if (config.styles.float === 'left') {
                selectedImage.style.marginRight = selectedImage.style.marginRight || '15px';
            } else if (config.styles.float === 'right') {
                selectedImage.style.marginLeft = selectedImage.style.marginLeft || '15px';
            }
        }

        // IMPORTANTE: Forzar actualización de Quill para que persista los cambios
        const range = quill.getSelection() || { index: 0, length: 0 };
        quill.updateContents([{ retain: quill.getLength() }], 'user');

        setModalVisible(false);
        setSelectedImage(null);
    }, [selectedImage, quillRef]);

    // Borrar imagen
    const deleteImage = useCallback(() => {
        if (!selectedImage || !quillRef.current) return;
        const quill = quillRef.current.getEditor();
        const imgBlot = quill.constructor.find(selectedImage);
        if (imgBlot) {
            const index = quill.getIndex(imgBlot);
            quill.deleteText(index, 1);
        }
        setContextMenu({ visible: false, x: 0, y: 0 });
        setSelectedImage(null);
    }, [selectedImage, quillRef]);

    const closeModal = useCallback(() => {
        setModalVisible(false);
        setSelectedImage(null);
    }, []);

    return {
        modalVisible,
        selectedImage,
        contextMenu,
        openConfigFromMenu,
        applyImageConfig,
        deleteImage,
        closeModal,
        closeContextMenu: () => setContextMenu({ visible: false, x: 0, y: 0 }),
        alignLeft,
        alignCenter,
        alignRight
    };
}
