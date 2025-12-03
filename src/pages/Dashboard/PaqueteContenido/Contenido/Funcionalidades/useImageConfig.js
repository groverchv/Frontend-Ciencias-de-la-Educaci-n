// src/pages/Dashboard/PaqueteContenido/Contenido/Funcionalidades/useImageConfig.js
import { useState, useCallback, useEffect } from 'react';

export default function useImageConfig(quillRef, contenidoHtml) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    const [clipboard, setClipboard] = useState(null); // Internal clipboard for copy/paste

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

                    // Click IZQUIERDO: Seleccionar para redimensionar y arrastrar
                    img.onclick = (e) => {
                        e.stopPropagation();
                        console.log('🖱️ Click izquierdo - Activando resize y drag');

                        // Seleccionar la imagen en Quill para activar resize handles
                        const quill = quillRef.current?.getEditor();
                        if (quill) {
                            const imgBlot = quill.constructor.find(img);
                            if (imgBlot) {
                                const imgIndex = quill.getIndex(imgBlot);
                                // Esto activa el módulo quill-image-resize-module
                                quill.setSelection(imgIndex, 1, 'user');
                            }
                        }
                    };

                    // Click DERECHO: Menú contextual
                    img.oncontextmenu = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const imgRect = img.getBoundingClientRect();
                        setSelectedImage(img);
                        setContextMenu({
                            visible: true,
                            x: e.clientX,
                            y: e.clientY,
                            imageRect: {
                                left: imgRect.left,
                                top: imgRect.top,
                                right: imgRect.right,
                                bottom: imgRect.bottom,
                                width: imgRect.width,
                                height: imgRect.height
                            }
                        });
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
    }, [contenidoHtml]); // Usar con tenidoHtml como dependencia

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
        selectedImage.classList.remove('align-left', 'align-center', 'align-right');

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

        const range = quill.getSelection() || { index: 0, length: 0 };
        quill.updateContents([{ retain: quill.getLength() }], 'user');

        setContextMenu({ visible: false, x: 0, y: 0 });
    }, [selectedImage, quillRef]);

    const alignLeft = useCallback(() => applyQuickAlignment('left'), [applyQuickAlignment]);
    const alignCenter = useCallback(() => applyQuickAlignment('center'), [applyQuickAlignment]);
    const alignRight = useCallback(() => applyQuickAlignment('right'), [applyQuickAlignment]);

    // Copy image
    const copyImage = useCallback(() => {
        if (!selectedImage) return;
        setClipboard({
            src: selectedImage.src,
            alt: selectedImage.getAttribute('alt') || '',
            title: selectedImage.getAttribute('title') || '',
            style: selectedImage.getAttribute('style') || '',
            className: selectedImage.className || ''
        });
        setContextMenu({ visible: false, x: 0, y: 0 });
    }, [selectedImage]);

    // Cut image
    const cutImage = useCallback(() => {
        if (!selectedImage) return;
        setClipboard({
            src: selectedImage.src,
            alt: selectedImage.getAttribute('alt') || '',
            title: selectedImage.getAttribute('title') || '',
            style: selectedImage.getAttribute('style') || '',
            className: selectedImage.className || ''
        });
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const imgBlot = quill.constructor.find(selectedImage);
            if (imgBlot) {
                const index = quill.getIndex(imgBlot);
                quill.deleteText(index, 1);
            }
        }
        setContextMenu({ visible: false, x: 0, y: 0 });
        setSelectedImage(null);
    }, [selectedImage, quillRef]);

    // Paste image
    const pasteImage = useCallback(() => {
        if (!clipboard || !quillRef.current) return;
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection() || { index: 0 };
        quill.insertEmbed(range.index, 'image', clipboard.src);
        setTimeout(() => {
            const images = quill.root.querySelectorAll('img');
            const newImg = images[images.length - 1];
            if (newImg && newImg.src === clipboard.src) {
                if (clipboard.alt) newImg.setAttribute('alt', clipboard.alt);
                if (clipboard.title) newImg.setAttribute('title', clipboard.title);
                if (clipboard.style) newImg.setAttribute('style', clipboard.style);
                if (clipboard.className) newImg.className = clipboard.className;
            }
        }, 50);
        setContextMenu({ visible: false, x: 0, y: 0 });
    }, [clipboard, quillRef]);

    // Rotate image
    const rotateImage = useCallback(() => {
        if (!selectedImage) return;
        const currentRotation = parseInt(selectedImage.getAttribute('data-rotation') || '0');
        const newRotation = (currentRotation + 90) % 360;
        selectedImage.setAttribute('data-rotation', newRotation);
        selectedImage.style.transform = `rotate(${newRotation}deg)`;
        setContextMenu({ visible: false, x: 0, y: 0 });
    }, [selectedImage]);

    // Open crop modal
    const openCropModal = useCallback(() => {
        setContextMenu({ visible: false, x: 0, y: 0 });
        setModalVisible(true);
    }, []);

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
            selectedImage.classList.remove('align-left', 'align-center', 'align-right');
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
            selectedImage.classList.remove('align-left', 'align-center', 'align-right');

            if (config.styles.float === 'left') {
                selectedImage.style.marginRight = selectedImage.style.marginRight || '15px';
            } else if (config.styles.float === 'right') {
                selectedImage.style.marginLeft = selectedImage.style.marginLeft || '15px';
            }
        }

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
        clipboard,
        openConfigFromMenu,
        applyImageConfig,
        deleteImage,
        copyImage,
        cutImage,
        pasteImage,
        rotateImage,
        openCropModal,
        closeModal,
        closeContextMenu: () => setContextMenu({ visible: false, x: 0, y: 0 }),
        alignLeft,
        alignCenter,
        alignRight
    };
}
