Sebastian Medina Garcia

Alfonso Murillo Lora


Github principal: https://github.com/SebastianM1206/sebbi/ 

Drive con anexos:  https://drive.google.com/drive/folders/1sWjxn_oHJLyFMgivLr3-svdVAvc5KEkC?usp=sharing

Figma: https://www.figma.com/design/IIY24vITNVnLAQb8qI1ro6/Untitled?node-id=0-1&p=f 


Githubs usados para realizar el deploy en vercel: 

https://github.com/Apps-Factory-Colombia/backend-sebbi/ 

https://github.com/Apps-Factory-Colombia/sebbi-frontend


-----------------------------------------------------------------------------Estructuras de datos y algoritmos II -------------------------------------------------------
SEBASTIAN MEDINA GARCIA  / ALFONSO MURILLO LORA

# Estructuras de Datos en el Proyecto

Este proyecto implementa dos estructuras de datos principales para diferentes funcionalidades:

## 1. Lista Enlazada Circular (Circular Linked List)

**Ubicación**: `src/app/home/utils/TestimonialLinkedList.js`

### Propósito
La lista enlazada circular se utiliza para manejar la sección de testimonios en la página principal. Esta estructura nos permite:
- Mostrar testimonios de forma cíclica
- Navegar entre testimonios de manera eficiente
- Mantener un orden circular de los testimonios
![image](https://github.com/user-attachments/assets/abd78a36-342f-422f-970e-6b9e0c0160a2)


### Implementación
- Clase `TestimonialNode`: Representa cada nodo de la lista
- Clase `TestimonialLinkedList`: Implementa la lista circular con métodos como:
  - `add()`: Añade nuevos testimonios
  - `getCurrent()`: Obtiene el testimonio actual
  - `moveToNext()`: Avanza al siguiente testimonio
  - `moveToPrevious()`: Retrocede al testimonio anterior
  - `moveToIndex()`: Navega a un testimonio específico

## 2. Árbol (Tree)

**Ubicación**: `src/app/dashboard/components/LibrarySidebar.jsx`

### Propósito
El árbol se utiliza para implementar la estructura de carpetas en la biblioteca de documentos. Esta estructura permite:
- Organizar documentos en una jerarquía de carpetas
- Facilitar la navegación y organización de documentos subidos recientemente por el usuario

![image](https://github.com/user-attachments/assets/d7456d45-4848-4a40-9a0e-a43aabe30d06)

  

### Implementación
- Clase `FolderNode`: Representa cada nodo del árbol con:
  - ID único
  - Nombre de la carpeta
  - ID del padre
  - Lista de subcarpetas (children)
  - Lista de PDFs en la carpeta

- Clase `FolderTree`: Implementa el árbol con métodos como:
  - `addFolder()`: Añade nuevas carpetas
  - `removeFolder()`: Elimina carpetas y sus subcarpetas
  - `moveFolder()`: Mueve carpetas entre diferentes niveles
  - `movePdf()`: Mueve PDFs entre carpetas
  - `getRootFolders()`: Obtiene las carpetas raíz
  - `serialize()` y `deserialize()`: Para persistencia de datos

### Uso en la Aplicación
- La estructura de árbol se utiliza en el sidebar de la biblioteca para mostrar y gestionar la jerarquía de carpetas de documentos
- Permite operaciones de arrastrar y soltar (drag and drop) para reorganizar documentos
- Mantiene la persistencia de la estructura de carpetas en el almacenamiento local (Por facilidades de la implementación inicial)

